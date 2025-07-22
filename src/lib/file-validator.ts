/**
 * File Validation SDK
 * Frontend/Backend agnostic file validation library
 */

export interface FileValidationConfig {
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxFiles: number;
  requireHash: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: FileMetadata;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  extension: string;
  hash?: string;
  lastModified: number;
}

export class FileValidator {
  private config: FileValidationConfig;

  constructor(config: FileValidationConfig) {
    this.config = config;
  }

  /**
   * Validate a single file
   */
  async validateFile(file: File): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors, warnings };
    }

    if (!file.name) {
      errors.push('File name is required');
      return { isValid: false, errors, warnings };
    }

    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: this.getFileExtension(file.name),
      lastModified: file.lastModified || Date.now(),
    };

    // Size validation
    if (file.size > this.config.maxFileSize) {
      errors.push(`File size ${this.formatBytes(file.size)} exceeds maximum allowed size ${this.formatBytes(this.config.maxFileSize)}`);
    }

    // MIME type validation
    if (this.config.allowedMimeTypes.length > 0) {
      const isAllowedMime = this.config.allowedMimeTypes.some(allowedType => 
        this.isMatchingMimeType(file.type, allowedType)
      );
      if (!isAllowedMime) {
        errors.push(`File type ${file.type} is not allowed. Allowed types: ${this.config.allowedMimeTypes.join(', ')}`);
      }
    }

    // Extension validation
    if (this.config.allowedExtensions.length > 0) {
      if (!this.config.allowedExtensions.includes(metadata.extension.toLowerCase())) {
        errors.push(`File extension ${metadata.extension} is not allowed. Allowed extensions: ${this.config.allowedExtensions.join(', ')}`);
      }
    }

    // Magic byte validation
    try {
      const magicByteResult = await this.validateMagicBytes(file);
      if (!magicByteResult.isValid) {
        errors.push(magicByteResult.error || 'File signature validation failed');
      }
    } catch (error) {
      warnings.push('Could not validate file signature');
    }

    // Generate hash if required
    if (this.config.requireHash) {
      try {
        metadata.hash = await this.generateFileHash(file);
      } catch (error) {
        warnings.push('Could not generate file hash');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata,
    };
  }

  /**
   * Validate multiple files
   */
  async validateFiles(files: File[]): Promise<ValidationResult> {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    if (files.length > this.config.maxFiles) {
      allErrors.push(`Too many files. Maximum allowed: ${this.config.maxFiles}, provided: ${files.length}`);
    }

    const results = await Promise.all(files.map(file => this.validateFile(file)));
    
    results.forEach((result, index) => {
      if (!result.isValid) {
        result.errors.forEach(error => {
          allErrors.push(`File ${index + 1} (${files[index]?.name || 'unknown'}): ${error}`);
        });
      }
      result.warnings.forEach(warning => {
        allWarnings.push(`File ${index + 1} (${files[index]?.name || 'unknown'}): ${warning}`);
      });
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Check if MIME type matches allowed pattern
   */
  private isMatchingMimeType(fileType: string, allowedType: string): boolean {
    if (allowedType.endsWith('/*')) {
      const prefix = allowedType.slice(0, -2);
      return fileType.startsWith(prefix);
    }
    return fileType === allowedType;
  }

  /**
   * Validate magic bytes of file
   */
  private async validateMagicBytes(file: File): Promise<{ isValid: boolean; error?: string }> {
    try {
      const buffer = await file.slice(0, 16).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // Basic magic byte patterns
      const signatures: Record<string, number[][]> = {
        'image/jpeg': [[0xFF, 0xD8, 0xFF]],
        'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
        'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
        'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
        'text/plain': [], // Skip validation for text files
      };

      if (!file.type || file.type === 'application/octet-stream') {
        return { isValid: true }; // Skip validation for unknown types
      }

      const expectedSignatures = signatures[file.type];
      if (!expectedSignatures || expectedSignatures.length === 0) {
        return { isValid: true }; // Skip validation if no signature defined
      }

      const isValid = expectedSignatures.some(signature => 
        signature.every((byte, index) => bytes[index] === byte)
      );

      return { 
        isValid, 
        error: isValid ? undefined : `File signature does not match expected type ${file.type}` 
      };
    } catch (error) {
      return { isValid: false, error: 'Could not read file signature' };
    }
  }

  /**
   * Generate SHA-256 hash of file
   */
  private async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Default validation configurations
 */
export const DEFAULT_CONFIGS: Record<string, FileValidationConfig> = {
  IMAGE_ONLY: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/*'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxFiles: 10,
    requireHash: true,
  },
  DOCUMENT_ONLY: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf', 'text/*'],
    allowedExtensions: ['pdf', 'txt', 'doc', 'docx'],
    maxFiles: 5,
    requireHash: true,
  },
  GENERAL: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/*', 'application/pdf', 'text/*'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt'],
    maxFiles: 10,
    requireHash: true,
  },
};