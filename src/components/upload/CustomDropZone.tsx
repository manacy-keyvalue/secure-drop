import { useCallback, useState, useRef, DragEvent } from "react";
import {
  Upload,
  FileCheck,
  AlertTriangle,
  X,
  Image,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  FileValidator,
  DEFAULT_CONFIGS,
  ValidationResult,
} from "@/lib/file-validator";

interface FileWithPreview extends File {
  preview?: string;
  id: string;
  uploadProgress?: number;
  status?: "pending" | "uploading" | "success" | "error";
  error?: string;
  validationResult?: ValidationResult;
}

interface CustomDropZoneProps {
  onUploadComplete?: (files: Record<string, unknown>[]) => void;
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
  config?: "IMAGE_ONLY" | "DOCUMENT_ONLY" | "GENERAL";
}

export function CustomDropZone({
  onUploadComplete,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ["image/*", "application/pdf", "text/*"],
  config = "GENERAL",
}: CustomDropZoneProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize validator with config
  const validatorConfig = {
    ...DEFAULT_CONFIGS[config],
    maxFileSize: maxSize,
    maxFiles,
  };
  const validator = new FileValidator(validatorConfig);

  const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        await processFiles(selectedFiles);
      }
    },
    []
  );

  const processFiles = async (newFiles: File[]) => {
    if (!newFiles.length) return;

    // Validate files
    const validation = await validator.validateFiles(newFiles);

    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        toast({
          title: "File validation failed",
          description: error,
          variant: "destructive",
        });
      });
    }

    // Show warnings
    validation.warnings.forEach((warning) => {
      toast({
        title: "File warning",
        description: warning,
        variant: "default",
      });
    });

    // Process valid files
    const validFiles: FileWithPreview[] = [];

    for (const file of newFiles) {
      const fileValidation = await validator.validateFile(file);

      // Create a FileWithPreview that preserves File properties
      const fileWithPreview = {
        // Preserve native File properties
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        webkitRelativePath: file.webkitRelativePath,
        // Add File methods
        arrayBuffer: file.arrayBuffer.bind(file),
        slice: file.slice.bind(file),
        stream: file.stream.bind(file),
        text: file.text.bind(file),
        // Add our custom properties
        id: Math.random().toString(36).substr(2, 9),
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        status: fileValidation.isValid ? "pending" : "error",
        uploadProgress: 0,
        validationResult: fileValidation,
        error: fileValidation.isValid
          ? undefined
          : fileValidation.errors.join(", "),
      } as FileWithPreview;

      validFiles.push(fileWithPreview);
    }

    setFiles((prev) => [...prev, ...validFiles].slice(0, maxFiles));
  };

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (fileId: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setUploading(true);
    const uploadedFiles = [];

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      for (const file of pendingFiles) {
        // Update file status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "uploading" as const } : f
          )
        );

        // Extract file properties directly from File object
        const originalFile = file as File;
        const fileName = originalFile.name || "unknown";
        const fileSize = originalFile.size || 0;
        const fileType = originalFile.type || "application/octet-stream";

        const fileExt = fileName.includes(".")
          ? fileName.split(".").pop()
          : "bin";
        const uniqueFileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}.${fileExt}`;
        const filePath = `${user.id}/${uniqueFileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("files")
          .upload(filePath, originalFile);

        if (uploadError) {
          throw uploadError;
        }

        // Use hash from validation result or generate new one
        let fileHash = file.validationResult?.metadata?.hash;
        if (!fileHash) {
          const arrayBuffer = await originalFile.arrayBuffer();
          const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          fileHash = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        }

        // Save file metadata to database
        const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

        // Validate file properties
        if (fileSize === 0 && originalFile.size !== 0) {
          console.warn(
            "File size mismatch for file:",
            fileName,
            "original:",
            originalFile.size
          );
        }

        const { data: fileRecord, error: dbError } = await supabase
          .from("file_uploads")
          .insert({
            user_id: user.id,
            filename: uniqueFileName,
            original_filename: fileName,
            file_size: fileSize,
            mime_type: fileType,
            file_path: filePath,
            file_hash: fileHash,
            status: "scanning",
            expires_at: expiresAt.toISOString(),
          })
          .select()
          .single();

        if (dbError) {
          throw dbError;
        }

        uploadedFiles.push(fileRecord);

        // Update file status to success
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: "success" as const, uploadProgress: 100 }
              : f
          )
        );

        // Log audit trail
        await supabase.from("audit_logs").insert({
          action: "file_upload",
          resource_type: "file",
          resource_id: fileRecord.id,
          details: {
            filename: fileName,
            size: fileSize,
            mime_type: fileType,
            validation_errors: file.validationResult?.errors || [],
            validation_warnings: file.validationResult?.warnings || [],
          },
        });
      }

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      });

      onUploadComplete?.(uploadedFiles);
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Upload failed with unknown error";

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Update failed files status
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error" as const, error: errorMessage }
            : f
        )
      );
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <FileCheck className="w-4 h-4 text-success" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <Upload className="w-4 h-4" />;
    }
  };

  const getFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith("image/")) {
      return <Image className="w-6 h-6 text-primary" />;
    }
    return <FileText className="w-6 h-6 text-muted-foreground" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-success text-success-foreground";
      case "error":
        return "bg-destructive text-destructive-foreground";
      case "uploading":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 security-glass
          ${
            isDragOver
              ? "border-primary bg-primary/10 glow-primary"
              : "border-border hover:border-primary/50 hover:bg-muted/20"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          accept={allowedTypes.join(",")}
          className="hidden"
        />

        {/* Scanning animation overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/5 rounded-lg">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/30 scan-animation" />
          </div>
        )}

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              {isDragOver ? "Drop files here..." : "Drag & drop files"}
            </h3>
            <p className="text-muted-foreground">
              or click to browse • Max {maxFiles} files •{" "}
              {formatFileSize(maxSize)} each
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {allowedTypes.map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type.replace("/*", "").replace("application/", "")}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold">Files ({files.length})</h4>

          {files.map((file) => (
            <div key={file.id} className="security-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded border"
                    />
                  ) : (
                    getFileIcon(file)
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(file.status!)}
                      <span className="font-medium truncate">
                        {file.name || "Unknown file"}
                      </span>
                      <Badge className={getStatusColor(file.status!)}>
                        {file.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} •{" "}
                      {file.type || "Unknown type"}
                    </p>

                    {file.status === "uploading" && (
                      <Progress value={file.uploadProgress} className="mt-2" />
                    )}

                    {file.error && (
                      <Alert className="mt-2 border-destructive bg-destructive/10">
                        <AlertDescription className="text-sm text-destructive">
                          {file.error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {file.validationResult?.warnings &&
                      file.validationResult.warnings.length > 0 && (
                        <Alert className="mt-2 border-yellow-500 bg-yellow-500/10">
                          <AlertDescription className="text-sm text-yellow-700">
                            {file.validationResult.warnings.join(", ")}
                          </AlertDescription>
                        </Alert>
                      )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  disabled={file.status === "uploading"}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            onClick={uploadFiles}
            disabled={uploading || files.every((f) => f.status !== "pending")}
            className="w-full gradient-primary glow-primary"
          >
            {uploading
              ? "Uploading..."
              : `Upload ${
                  files.filter((f) => f.status === "pending").length
                } File(s)`}
          </Button>
        </div>
      )}
    </div>
  );
}
