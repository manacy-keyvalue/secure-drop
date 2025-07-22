/**
 * Secure File Preview Component with Watermarking
 * Handles Image and Text file previews with security controls
 */

import { useState, useEffect, useRef } from "react";
import {
  Download,
  X,
  FileText,
  Image as ImageIcon,
  Shield,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface PreviewFile {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  downloadCount: number;
  watermarkApplied: boolean;
}

interface SecurePreviewProps {
  file: PreviewFile;
  onClose: () => void;
  allowDownload?: boolean;
  watermarkText?: string;
  previewOnly?: boolean;
}

export function SecurePreview({
  file,
  onClose,
  allowDownload = true,
  watermarkText = "CONFIDENTIAL",
  previewOnly = false,
}: SecurePreviewProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFileContent();
  }, [file.id]);

  const loadFileContent = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get signed URL for preview
      const { data, error: urlError } = await supabase.storage
        .from("files")
        .createSignedUrl(file.filePath, 3600); // 1 hour expiry

      if (urlError) throw urlError;

      if (file.mimeType.startsWith("text/")) {
        // Load text file
        const response = await fetch(data.signedUrl);
        const text = await response.text();
        setFileContent(text);
      } else if (file.mimeType.startsWith("image/")) {
        // Load image file
        setFileContent(data.signedUrl);
      } else if (file.mimeType === "application/pdf") {
        // For PDF files, provide download option
        setFileContent(data.signedUrl);
      } else {
        setError("File type not supported for preview");
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Preview Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!allowDownload || previewOnly) {
      toast({
        title: "Download Restricted",
        description: "This file is preview-only and cannot be downloaded.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Get signed URL for download
      const { data, error: urlError } = await supabase.storage
        .from("files")
        .createSignedUrl(file.filePath, 300); // 5 minutes for download

      if (urlError) throw urlError;

      // Open download in new window
      window.open(data.signedUrl, "_blank");

      // Update download count
      await supabase
        .from("file_uploads")
        .update({ download_count: file.downloadCount + 1 })
        .eq("id", file.id);

      // Log download event
      await supabase.from("audit_logs").insert({
        action: "file_download",
        resource_type: "file",
        resource_id: file.id,
        details: {
          filename: file.originalFilename,
          downloadCount: file.downloadCount + 1,
        },
      });

      toast({
        title: "Download Started",
        description: `Downloading ${file.originalFilename}...`,
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyWatermark = (canvas: HTMLCanvasElement, text: string) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save current context
    ctx.save();

    // Set watermark style
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#ff0000";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.rotate(-Math.PI / 4); // Rotate -45 degrees

    // Apply watermark at multiple positions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    for (let x = -canvasWidth; x < canvasWidth * 2; x += 200) {
      for (let y = -canvasHeight; y < canvasHeight * 2; y += 100) {
        ctx.fillText(text, x, y);
      }
    }

    // Restore context
    ctx.restore();
  };

  const renderImagePreview = () => {
    if (!fileContent) return null;

    return (
      <div className="relative">
        <img
          src={fileContent}
          alt={file.originalFilename}
          className="max-w-full max-h-96 object-contain mx-auto"
          onLoad={(e) => {
            if (file.watermarkApplied && canvasRef.current) {
              const img = e.target as HTMLImageElement;
              const canvas = canvasRef.current;
              const ctx = canvas.getContext("2d");

              if (ctx) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);
                applyWatermark(canvas, watermarkText);
              }
            }
          }}
        />
        {file.watermarkApplied && (
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 max-w-full max-h-96 object-contain mx-auto pointer-events-none"
          />
        )}
      </div>
    );
  };

  const renderTextPreview = () => {
    if (!fileContent) return null;

    return (
      <div className="relative">
        <pre className="whitespace-pre-wrap text-sm p-4 bg-muted rounded max-h-96 overflow-y-auto">
          {fileContent}
        </pre>
        {file.watermarkApplied && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-20 text-red-500 font-bold text-lg transform -rotate-45 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-8 w-full h-full">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center">
                    {watermarkText}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPDFMessage = () => {
    return (
      <div className="text-center p-8 space-y-4">
        <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">PDF Preview</h3>
          <p className="text-muted-foreground">
            PDF files cannot be previewed in the browser. Click download to view
            the file.
          </p>
        </div>
      </div>
    );
  };

  const getFileIcon = () => {
    if (file.mimeType.startsWith("image/"))
      return <ImageIcon className="w-5 h-5" />;
    if (file.mimeType === "application/pdf")
      return <FileText className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isExpired = new Date(file.expiresAt) < new Date();

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden security-glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {getFileIcon()}
              {file.originalFilename}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatFileSize(file.fileSize)}</span>
              <span>Downloaded {file.downloadCount} times</span>
              <Badge variant={isExpired ? "destructive" : "secondary"}>
                {isExpired ? "Expired" : "Active"}
              </Badge>
              {file.watermarkApplied && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Watermarked
                </Badge>
              )}
              {previewOnly && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  Preview Only
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allowDownload && !previewOnly && !isExpired && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-pulse-glow">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
          )}

          {error && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {isExpired && (
            <Alert className="border-warning bg-warning/10 mb-4">
              <AlertDescription className="text-warning">
                This file has expired and may not be available for download.
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {file.mimeType.startsWith("image/") &&
                fileContent &&
                renderImagePreview()}
              {file.mimeType.startsWith("text/") &&
                fileContent &&
                renderTextPreview()}
              {file.mimeType === "application/pdf" && renderPDFMessage()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
