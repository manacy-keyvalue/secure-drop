/**
 * Common types used across the SDK
 */

export interface UploadProgressEvent {
  fileId: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export interface SecurityScanResult {
  isClean: boolean;
  threats: SecurityThreat[];
  scanTime: number;
  scanner: string;
  confidence?: number;
  quarantined?: boolean;
  [key: string]: any; // Index signature for Supabase Json compatibility
}

export interface SecurityThreat {
  type: "virus" | "malware" | "injection" | "suspicious_content" | "yara_match";
  name: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  signature?: string;
  offset?: number;
}

export interface FileUploadResult {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  fileHash: string;
  status: string;
  downloadUrl?: string;
  expiresAt: string;
  securityScan?: SecurityScanResult;
}

export interface UploadConfig {
  endpoint: string;
  apiKey?: string;
  maxRetries: number;
  chunkSize: number;
  enableProgress: boolean;
}

export interface BackendUploadOptions {
  bucketName: string;
  expiryHours: number;
  requireScan: boolean;
  generateThumbnails: boolean;
  watermarkConfig?: {
    enabled: boolean;
    text: string;
    opacity: number;
  };
}

export interface AuditLogEntry {
  action: string;
  resourceType: string;
  resourceId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp?: string;
}
