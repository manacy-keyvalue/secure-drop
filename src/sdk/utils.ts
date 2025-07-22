/**
 * Utility functions for file operations and validation
 */

import { FileMetadata } from '../lib/file-validator';

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Generate a unique file identifier
 */
export function generateFileId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is an image based on MIME type
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if file is a document based on MIME type
 */
export function isDocumentFile(mimeType: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/rtf'
  ];
  return documentTypes.includes(mimeType) || mimeType.startsWith('text/');
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace dangerous characters
  return filename
    .replace(/[^\w\s.-]/gi, '')  // Remove special characters except dots, hyphens, and spaces
    .replace(/\s+/g, '_')        // Replace spaces with underscores
    .replace(/_{2,}/g, '_')      // Replace multiple underscores with single
    .replace(/^[.-]/, '')        // Remove leading dots or hyphens
    .substring(0, 255);          // Limit length
}

/**
 * Generate secure random filename
 */
export function generateSecureFilename(originalFilename: string): string {
  const extension = getFileExtension(originalFilename);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${random}.${extension}`;
}

/**
 * Calculate file hash using Web Crypto API
 */
export async function calculateFileHash(file: File | Buffer, algorithm: string = 'SHA-256'): Promise<string> {
  let buffer: ArrayBuffer;
  
  if (file instanceof File) {
    buffer = await file.arrayBuffer();
  } else {
    buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
  }
  
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate file metadata structure
 */
export function validateFileMetadata(metadata: Partial<FileMetadata>): FileMetadata | null {
  if (!metadata.name || !metadata.size || !metadata.type) {
    return null;
  }
  
  return {
    name: metadata.name,
    size: metadata.size,
    type: metadata.type,
    extension: metadata.extension || getFileExtension(metadata.name),
    lastModified: metadata.lastModified || Date.now(),
    hash: metadata.hash,
  };
}

/**
 * Create a download-safe filename
 */
export function createDownloadFilename(originalFilename: string, includeTimestamp: boolean = false): string {
  const sanitized = sanitizeFilename(originalFilename);
  
  if (includeTimestamp) {
    const extension = getFileExtension(sanitized);
    const nameWithoutExt = sanitized.replace(`.${extension}`, '');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${nameWithoutExt}_${timestamp}.${extension}`;
  }
  
  return sanitized;
}

/**
 * Check if MIME type is allowed based on pattern
 */
export function isMimeTypeAllowed(fileType: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(allowedType => {
    if (allowedType.endsWith('/*')) {
      const prefix = allowedType.slice(0, -2);
      return fileType.startsWith(prefix);
    }
    return fileType === allowedType;
  });
}

/**
 * Get appropriate icon name for file type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'file-text';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'file-text';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'file-spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'file-presentation';
  if (mimeType.startsWith('text/')) return 'file-text';
  return 'file';
}

/**
 * Estimate upload time based on file size and connection speed
 */
export function estimateUploadTime(fileSize: number, speedBytesPerSecond: number = 1024 * 1024): string {
  const seconds = fileSize / speedBytesPerSecond;
  
  if (seconds < 60) {
    return `${Math.ceil(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
  } else {
    const hours = Math.ceil(seconds / 3600);
    return `${hours}h`;
  }
}