/**
 * Backend utilities for server-side file operations
 * 
 * These utilities are designed to work in Node.js environments
 * and provide additional functionality for backend file processing.
 */

import { FileValidationConfig, ValidationResult } from '../lib/file-validator';
import { BackendUploadOptions, SecurityScanResult, AuditLogEntry, SecurityThreat } from './types';

/**
 * Backend file validator that can work with Node.js Buffer objects
 */
export class BackendFileValidator {
  private config: FileValidationConfig;

  constructor(config: FileValidationConfig) {
    this.config = config;
  }

  /**
   * Validate file buffer (for backend use)
   */
  async validateBuffer(
    buffer: Buffer, 
    filename: string, 
    mimeType: string
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Size validation
    if (buffer.length > this.config.maxFileSize) {
      errors.push(`File size ${this.formatBytes(buffer.length)} exceeds maximum allowed size ${this.formatBytes(this.config.maxFileSize)}`);
    }

    // MIME type validation
    if (this.config.allowedMimeTypes.length > 0) {
      const isAllowedMime = this.config.allowedMimeTypes.some(allowedType => 
        this.isMatchingMimeType(mimeType, allowedType)
      );
      if (!isAllowedMime) {
        errors.push(`File type ${mimeType} is not allowed. Allowed types: ${this.config.allowedMimeTypes.join(', ')}`);
      }
    }

    // Extension validation
    const extension = this.getFileExtension(filename).toLowerCase();
    if (this.config.allowedExtensions.length > 0) {
      if (!this.config.allowedExtensions.includes(extension)) {
        errors.push(`File extension ${extension} is not allowed. Allowed extensions: ${this.config.allowedExtensions.join(', ')}`);
      }
    }

    // Magic byte validation
    const magicByteResult = this.validateMagicBytes(buffer, mimeType);
    if (!magicByteResult.isValid) {
      errors.push(magicByteResult.error || 'File signature validation failed');
    }

    // Generate hash
    let hash: string | undefined;
    if (this.config.requireHash) {
      try {
        hash = await this.generateBufferHash(buffer);
      } catch (error) {
        warnings.push('Could not generate file hash');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        name: filename,
        size: buffer.length,
        type: mimeType,
        extension,
        lastModified: Date.now(),
        hash,
      },
    };
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  private isMatchingMimeType(fileType: string, allowedType: string): boolean {
    if (allowedType.endsWith('/*')) {
      const prefix = allowedType.slice(0, -2);
      return fileType.startsWith(prefix);
    }
    return fileType === allowedType;
  }

  private validateMagicBytes(buffer: Buffer, mimeType: string): { isValid: boolean; error?: string } {
    const signatures: Record<string, number[][]> = {
      'image/jpeg': [[0xFF, 0xD8, 0xFF]],
      'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
      'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
      'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
    };

    const expectedSignatures = signatures[mimeType];
    if (!expectedSignatures || expectedSignatures.length === 0) {
      return { isValid: true }; // Skip validation if no signature defined
    }

    const isValid = expectedSignatures.some(signature => 
      signature.every((byte, index) => buffer[index] === byte)
    );

    return { 
      isValid, 
      error: isValid ? undefined : `File signature does not match expected type ${mimeType}` 
    };
  }

  private async generateBufferHash(buffer: Buffer): Promise<string> {
    // For Node.js environment, you might want to use crypto module
    // This is a simplified version using Web Crypto API
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Simulate virus scanning (replace with actual antivirus integration)
 */
export async function performSecurityScan(
  buffer: Buffer, 
  filename: string
): Promise<SecurityScanResult> {
  // Simulate scanning delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simple checks (replace with real antivirus integration like ClamAV)
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif'];
  const hasSuspiciousExtension = suspiciousExtensions.some(ext => 
    filename.toLowerCase().endsWith(ext)
  );

  // Check for common malware signatures (very basic example)
  const malwareSignatures = [
    Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR', 'ascii'), // EICAR test signature
  ];

  const containsSignature = malwareSignatures.some(signature => 
    buffer.includes(signature)
  );

  const threats: SecurityThreat[] = [];
  if (hasSuspiciousExtension) {
    threats.push({
      type: 'suspicious_content',
      name: 'Suspicious Extension',
      severity: 'medium',
      description: 'Suspicious file extension detected'
    });
  }
  if (containsSignature) {
    threats.push({
      type: 'malware',
      name: 'Malware Signature',
      severity: 'high',
      description: 'Malware signature detected'
    });
  }

  return {
    isClean: threats.length === 0,
    threats,
    scanTime: 1000,
    scanner: 'SecureDrop Scanner v1.0',
  };
}

/**
 * Generate audit log entry
 */
export function createAuditLogEntry(
  action: string,
  resourceType: string,
  resourceId: string,
  details: Record<string, any> = {},
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): AuditLogEntry {
  return {
    action,
    resourceType,
    resourceId,
    userId,
    ipAddress,
    userAgent,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Storage cleanup utility for expired files
 */
export interface CleanupResult {
  deletedCount: number;
  freedSpace: number;
  errors: string[];
}

export async function cleanupExpiredFiles(
  getExpiredFiles: () => Promise<Array<{ id: string; filePath: string; fileSize: number }>>,
  deleteFile: (filePath: string) => Promise<boolean>
): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedCount: 0,
    freedSpace: 0,
    errors: [],
  };

  try {
    const expiredFiles = await getExpiredFiles();
    
    for (const file of expiredFiles) {
      try {
        const deleted = await deleteFile(file.filePath);
        if (deleted) {
          result.deletedCount++;
          result.freedSpace += file.fileSize;
        } else {
          result.errors.push(`Failed to delete file: ${file.filePath}`);
        }
      } catch (error) {
        result.errors.push(`Error deleting file ${file.filePath}: ${error}`);
      }
    }
  } catch (error) {
    result.errors.push(`Error fetching expired files: ${error}`);
  }

  return result;
}

/**
 * Generate file metadata for storage
 */
export function generateFileMetadata(
  filename: string,
  buffer: Buffer,
  mimeType: string,
  options: BackendUploadOptions
) {
  const timestamp = new Date();
  const expiresAt = new Date(timestamp.getTime() + options.expiryHours * 60 * 60 * 1000);
  
  return {
    originalFilename: filename,
    filename: `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${filename.split('.').pop()}`,
    fileSize: buffer.length,
    mimeType,
    uploadedAt: timestamp.toISOString(),
    expiresAt: expiresAt.toISOString(),
    requiresScan: options.requireScan,
    generateThumbnails: options.generateThumbnails,
    watermarkConfig: options.watermarkConfig,
  };
}

/**
 * Validate upload configuration
 */
export function validateUploadConfig(config: Partial<BackendUploadOptions>): BackendUploadOptions {
  return {
    bucketName: config.bucketName || 'uploads',
    expiryHours: Math.max(1, Math.min(720, config.expiryHours || 72)), // 1 hour to 30 days
    requireScan: config.requireScan ?? true,
    generateThumbnails: config.generateThumbnails ?? false,
    watermarkConfig: config.watermarkConfig || {
      enabled: false,
      text: 'CONFIDENTIAL',
      opacity: 0.5,
    },
  };
}