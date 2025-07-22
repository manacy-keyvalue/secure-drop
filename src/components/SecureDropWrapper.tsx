/**
 * SecureDrop React Wrapper Component
 * Plug-and-play integration for secure file uploads
 */

import { useState, useCallback } from "react";
import { CustomDropZone } from "./upload/CustomDropZone";
import { SecurityScanner, SECURITY_CONFIGS } from "@/lib/security-scanner";
import { FileValidator, DEFAULT_CONFIGS } from "@/lib/file-validator";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  CheckCircle,
  XCircle,
  Download,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export interface SecureDropConfig {
  maxFiles?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
  securityLevel?: "basic" | "moderate" | "strict";
  enableVirusScanning?: boolean;
  enableInjectionDetection?: boolean;
  enableYaraScanning?: boolean;
  customSignatures?: string[];
  expiryHours?: number;
  requireWatermark?: boolean;
  watermarkText?: string;
  generateThumbnails?: boolean;
  theme?: "light" | "dark" | "auto";
  showProgress?: boolean;
  showPreview?: boolean;
  allowDownload?: boolean;
  webhookUrl?: string;
  onUploadStart?: (files: File[]) => void;
  onUploadProgress?: (progress: number, file: File) => void;
  onUploadComplete?: (results: Record<string, unknown>[]) => void;
  onUploadError?: (error: Error, file?: File) => void;
  onFileValidated?: (file: File, isValid: boolean, errors: string[]) => void;
  onThreatDetected?: (file: File, threats: string[]) => void;
}

interface SecureDropWrapperProps extends SecureDropConfig {
  className?: string;
  disabled?: boolean;
}

interface FileDisplayData {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  status: string;
}

export default function SecureDropWrapper({
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024,
  allowedTypes = ["image/*", "application/pdf", "text/*"],
  securityLevel = "moderate",
  enableVirusScanning = true,
  enableInjectionDetection = true,
  enableYaraScanning = false,
  customSignatures = [],
  expiryHours = 72,
  requireWatermark = false,
  watermarkText = "SecureDrop",
  generateThumbnails = false,
  theme = "auto",
  showProgress = true,
  showPreview = true,
  allowDownload = true,
  webhookUrl,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onFileValidated,
  onThreatDetected,
  className,
  disabled = false,
}: SecureDropWrapperProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileDisplayData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const processFileData = (file: Record<string, unknown>): FileDisplayData => {
    // Extract and normalize file properties
    const filename = String(
      file.original_filename ||
        file.originalFilename ||
        file.filename ||
        "Unknown File"
    );

    const rawSize = file.file_size || file.fileSize || file.size || 0;
    const fileSize =
      typeof rawSize === "number" ? rawSize : parseInt(String(rawSize)) || 0;

    const mimeType = String(
      file.mime_type || file.mimeType || file.type || "application/octet-stream"
    );

    const status = String(file.status || "uploaded");

    const id = String(file.id || file.file_id || Math.random().toString(36));

    return {
      id,
      filename,
      fileSize,
      mimeType,
      status,
    };
  };

  const handleUploadComplete = useCallback(
    async (files: Record<string, unknown>[]) => {
      try {
        // Process and normalize file data
        const processedFiles = files.map((file) => processFileData(file));

        setUploadedFiles(processedFiles);
        onUploadComplete?.(files);

        // Send webhook notification if configured
        if (webhookUrl) {
          try {
            await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event: "files_uploaded",
                data: files,
                timestamp: new Date().toISOString(),
              }),
            });
          } catch (error) {
            console.error("Webhook notification failed:", error);
          }
        }

        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${files.length} file(s) with security scanning`,
        });
      } catch (error) {
        console.error("Error processing uploaded files:", error);
        setErrors((prev) => [...prev, "Failed to process uploaded files"]);
      }
    },
    [onUploadComplete, webhookUrl, toast]
  );

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const link = document.createElement("a");
      link.href = `/api/files/${fileId}/download`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading ${filename}...`,
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Could not download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));

      toast({
        title: "File Deleted",
        description: "File has been removed",
      });
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Delete Failed",
        description: "Could not delete file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    if (!bytes || isNaN(bytes)) return "Size unknown";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "scanning":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Shield className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Security Configuration Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            SecureDrop Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Security: {securityLevel.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              Max Size: {Math.round(maxFileSize / 1024 / 1024)}MB
            </Badge>
            <Badge variant="outline">Max Files: {maxFiles}</Badge>
            {enableVirusScanning && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Virus Scanning
              </Badge>
            )}
            {enableInjectionDetection && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Injection Detection
              </Badge>
            )}
            {requireWatermark && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Watermarking
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Secure File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomDropZone
            onUploadComplete={handleUploadComplete}
            maxFiles={maxFiles}
            maxSize={maxFileSize}
            allowedTypes={allowedTypes}
            config="GENERAL"
          />

          {/* Error Display */}
          {errors.length > 0 && (
            <Alert className="mt-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files Display */}
      {showPreview && uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={file.id || index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(file.status)}
                    </div>
                    <div>
                      <p className="font-medium">{file.filename}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.fileSize)} • {file.mimeType} •{" "}
                        {file.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {allowDownload && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file.id, file.filename)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
