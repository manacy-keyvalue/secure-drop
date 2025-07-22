/**
 * SecureDrop Backend SDK/API
 * Comprehensive backend integration for secure file uploads
 */

import { supabase } from "@/integrations/supabase/client";
import {
  SecurityScanner,
  SecurityScanResult,
  SECURITY_CONFIGS,
} from "@/lib/security-scanner";
import { AuditLogEntry, FileUploadResult, BackendUploadOptions } from "./types";

export interface LifecycleHooks {
  beforeUpload?: (file: File, metadata: FileMetadata) => Promise<boolean>;
  afterValidation?: (
    file: File,
    validationResult: ValidationResult
  ) => Promise<void>;
  beforeScan?: (file: File) => Promise<boolean>;
  afterScan?: (file: File, scanResult: SecurityScanResult) => Promise<void>;
  beforeStore?: (file: File, metadata: FileMetadata) => Promise<FileMetadata>;
  afterStore?: (uploadResult: FileUploadResult) => Promise<void>;
  onError?: (error: Error, context: string) => Promise<void>;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  hash: string;
  uploadedAt: Date;
  userId: string;
  fingerprint?: DeviceFingerprint;
  ipAddress?: string;
  userAgent?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: any; // Use any to avoid type conflicts with different FileMetadata definitions
}

export interface DeviceFingerprint {
  browserInfo: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  hash: string;
}

export interface StorageBackend {
  name: string;
  upload: (file: File, path: string, options?: any) => Promise<string>;
  download: (path: string) => Promise<Blob>;
  delete: (path: string) => Promise<boolean>;
  exists: (path: string) => Promise<boolean>;
  getSignedUrl: (path: string, expiresIn: number) => Promise<string>;
}

export class SecureDropAPI {
  private hooks: LifecycleHooks;
  private securityScanner: SecurityScanner;
  private storageBackend: StorageBackend;
  private auditLogger: AuditLogger;

  constructor(
    hooks: LifecycleHooks = {},
    securityConfig = SECURITY_CONFIGS.MODERATE
  ) {
    this.hooks = hooks;
    this.securityScanner = new SecurityScanner(securityConfig);
    this.storageBackend = new SupabaseStorageBackend();
    this.auditLogger = new AuditLogger();
  }

  /**
   * Complete file upload pipeline with all security checks
   */
  async uploadFile(
    file: File,
    options: BackendUploadOptions = {
      bucketName: "files",
      expiryHours: 72,
      requireScan: true,
      generateThumbnails: false,
    }
  ): Promise<FileUploadResult> {
    const startTime = Date.now();
    let metadata: FileMetadata;

    try {
      // 1. Generate initial metadata
      metadata = await this.generateFileMetadata(file);

      // 2. Lifecycle hook: beforeUpload
      if (this.hooks.beforeUpload) {
        const shouldContinue = await this.hooks.beforeUpload(file, metadata);
        if (!shouldContinue) {
          throw new Error("Upload rejected by beforeUpload hook");
        }
      }

      // 3. Validate file
      const validationResult = await this.validateFile(file);
      if (!validationResult.isValid) {
        await this.auditLogger.log({
          action: "file_upload_rejected",
          resourceType: "file",
          resourceId: "",
          userId: metadata.userId,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          details: {
            filename: file.name,
            errors: validationResult.errors,
            timestamp: new Date().toISOString(),
          },
        });
        throw new Error(
          `File validation failed: ${validationResult.errors.join(", ")}`
        );
      }

      // 4. Lifecycle hook: afterValidation
      if (this.hooks.afterValidation) {
        await this.hooks.afterValidation(file, validationResult);
      }

      // 5. Security scanning
      let scanResult: SecurityScanResult | null = null;
      if (options.requireScan) {
        // Lifecycle hook: beforeScan
        if (this.hooks.beforeScan) {
          const shouldScan = await this.hooks.beforeScan(file);
          if (shouldScan) {
            scanResult = await this.securityScanner.scanFile(file);

            // Lifecycle hook: afterScan
            if (this.hooks.afterScan) {
              await this.hooks.afterScan(file, scanResult);
            }

            if (!scanResult.isClean) {
              await this.auditLogger.log({
                action: "security_threat_detected",
                resourceType: "file",
                resourceId: "",
                userId: metadata.userId,
                details: {
                  filename: file.name,
                  threats: scanResult.threats,
                  scanTime: scanResult.scanTime,
                  confidence: scanResult.confidence,
                },
              });
              throw new Error(`Security scan failed: File contains threats`);
            }
          }
        }
      }

      // 6. Lifecycle hook: beforeStore
      if (this.hooks.beforeStore) {
        metadata = await this.hooks.beforeStore(file, metadata);
      }

      // 7. Store file
      const filePath = this.generateFilePath(metadata.userId, file.name);
      const storedPath = await this.storageBackend.upload(file, filePath);

      // 8. Create database record
      const expiresAt = new Date(
        Date.now() + options.expiryHours * 60 * 60 * 1000
      );
      const fileRecord = await this.createFileRecord({
        filename: this.generateUniqueFilename(file.name),
        originalFilename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        filePath: storedPath,
        fileHash: metadata.hash,
        userId: metadata.userId,
        expiresAt,
        securityScanResult: scanResult,
      });

      // 9. Generate thumbnails if requested
      if (options.generateThumbnails && this.isImageFile(file)) {
        await this.generateThumbnails(file, fileRecord.id);
      }

      // 10. Apply watermark if requested
      if (options.watermarkConfig?.enabled) {
        await this.applyWatermark(fileRecord.id, options.watermarkConfig);
      }

      const uploadResult: FileUploadResult = {
        id: fileRecord.id,
        filename: fileRecord.filename,
        originalFilename: fileRecord.originalFilename,
        fileSize: fileRecord.fileSize,
        mimeType: fileRecord.mimeType,
        filePath: fileRecord.filePath,
        fileHash: fileRecord.fileHash,
        status: scanResult
          ? scanResult.isClean
            ? "approved"
            : "rejected"
          : "pending",
        expiresAt: expiresAt.toISOString(),
        securityScan: scanResult || undefined,
      };

      // 11. Lifecycle hook: afterStore
      if (this.hooks.afterStore) {
        await this.hooks.afterStore(uploadResult);
      }

      // 12. Audit log success
      await this.auditLogger.log({
        action: "file_upload_success",
        resourceType: "file",
        resourceId: uploadResult.id,
        userId: metadata.userId,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        details: {
          filename: uploadResult.originalFilename,
          fileSize: uploadResult.fileSize,
          processingTime: Date.now() - startTime,
          securityScanPassed: scanResult?.isClean ?? true,
        },
      });

      return uploadResult;
    } catch (error: any) {
      // Error handling
      if (this.hooks.onError) {
        await this.hooks.onError(error, "upload_pipeline");
      }

      // Audit log error
      await this.auditLogger.log({
        action: "file_upload_error",
        resourceType: "file",
        resourceId: "",
        userId: metadata?.userId || "unknown",
        details: {
          error: error.message,
          filename: file.name,
          processingTime: Date.now() - startTime,
        },
      });

      throw error;
    }
  }

  /**
   * Generate device fingerprint for tracking
   */
  generateDeviceFingerprint(): DeviceFingerprint {
    const nav = navigator;
    const screen = window.screen;

    const fingerprint = {
      browserInfo: `${nav.userAgent}`,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: nav.language,
      platform: nav.platform,
      cookieEnabled: nav.cookieEnabled,
      doNotTrack: nav.doNotTrack === "1",
      hash: "",
    };

    // Generate hash of all fingerprint data
    const fingerprintString = JSON.stringify(fingerprint);
    fingerprint.hash = this.simpleHash(fingerprintString);

    return fingerprint;
  }

  /**
   * Validate file using existing validator
   */
  private async validateFile(file: File): Promise<ValidationResult> {
    // Use existing file validator
    const { FileValidator, DEFAULT_CONFIGS } = await import(
      "@/lib/file-validator"
    );
    const validator = new FileValidator(DEFAULT_CONFIGS.GENERAL);
    return await validator.validateFile(file);
  }

  /**
   * Generate comprehensive file metadata
   */
  private async generateFileMetadata(file: File): Promise<FileMetadata> {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Generate file hash
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return {
      name: file.name,
      size: file.size,
      type: file.type,
      hash,
      uploadedAt: new Date(),
      userId: user.id,
      fingerprint: this.generateDeviceFingerprint(),
      ipAddress: await this.getUserIP(),
      userAgent: navigator.userAgent,
    };
  }

  /**
   * Create file record in database
   */
  private async createFileRecord(data: {
    filename: string;
    originalFilename: string;
    fileSize: number;
    mimeType: string;
    filePath: string;
    fileHash: string;
    userId: string;
    expiresAt: Date;
    securityScanResult?: SecurityScanResult | null;
  }): Promise<any> {
    const { data: record, error } = await supabase
      .from("file_uploads")
      .insert({
        user_id: data.userId,
        filename: data.filename,
        original_filename: data.originalFilename,
        file_size: data.fileSize,
        mime_type: data.mimeType,
        file_path: data.filePath,
        file_hash: data.fileHash,
        status: "scanning",
        expires_at: data.expiresAt.toISOString(),
        scan_result: data.securityScanResult || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create file record: ${error.message}`);
    }

    return record;
  }

  /**
   * Generate unique file path
   */
  private generateFilePath(userId: string, filename: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = filename.split(".").pop();
    return `${userId}/${timestamp}-${randomId}.${extension}`;
  }

  /**
   * Generate unique filename
   */
  private generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = originalFilename.split(".").pop();
    const baseName = originalFilename.replace(/\.[^/.]+$/, "");
    return `${baseName}-${timestamp}-${randomId}.${extension}`;
  }

  /**
   * Check if file is an image
   */
  private isImageFile(file: File): boolean {
    return file.type.startsWith("image/");
  }

  /**
   * Generate thumbnails for images
   */
  private async generateThumbnails(file: File, fileId: string): Promise<void> {
    if (!this.isImageFile(file)) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      // Generate different sizes
      const sizes = [150, 300, 600];
      for (const size of sizes) {
        canvas.width = size;
        canvas.height = (size * img.height) / img.width;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          async (blob) => {
            if (blob) {
              const thumbnailPath = `thumbnails/${fileId}_${size}.jpg`;
              await this.storageBackend.upload(blob as File, thumbnailPath);
            }
          },
          "image/jpeg",
          0.8
        );
      }

      URL.revokeObjectURL(img.src);
    } catch (error) {
      console.error("Thumbnail generation failed:", error);
    }
  }

  /**
   * Apply watermark to file
   */
  private async applyWatermark(fileId: string, config: any): Promise<void> {
    // Placeholder for watermark implementation
    console.log(`Applying watermark to file ${fileId}`, config);
  }

  /**
   * Get user IP address
   */
  private async getUserIP(): Promise<string> {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return "unknown";
    }
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}

/**
 * Supabase Storage Backend Implementation
 */
export class SupabaseStorageBackend implements StorageBackend {
  name = "supabase";

  async upload(file: File, path: string, options?: any): Promise<string> {
    const { data, error } = await supabase.storage
      .from("files")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        ...options,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    return data.path;
  }

  async download(path: string): Promise<Blob> {
    const { data, error } = await supabase.storage.from("files").download(path);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    return data;
  }

  async delete(path: string): Promise<boolean> {
    const { error } = await supabase.storage.from("files").remove([path]);

    return !error;
  }

  async exists(path: string): Promise<boolean> {
    const { data } = await supabase.storage
      .from("files")
      .list(path.split("/").slice(0, -1).join("/"));

    const filename = path.split("/").pop();
    return data?.some((item) => item.name === filename) ?? false;
  }

  async getSignedUrl(path: string, expiresIn: number): Promise<string> {
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }
}

/**
 * Audit Logger for compliance tracking
 */
export class AuditLogger {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Ensure required fields are not empty strings (which cause UUID constraint violations)
      const sanitizedEntry = {
        action: entry.action,
        resource_type: entry.resourceType,
        resource_id:
          entry.resourceId && entry.resourceId !== "" ? entry.resourceId : null,
        user_id: entry.userId && entry.userId !== "" ? entry.userId : null,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        details: entry.details,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("audit_logs")
        .insert(sanitizedEntry);

      if (error) {
        console.error("Audit logging failed:", error);
      }
    } catch (error) {
      console.error("Audit logging error:", error);
    }
  }
}

/**
 * Export default instance
 */
export const secureDropAPI = new SecureDropAPI();
