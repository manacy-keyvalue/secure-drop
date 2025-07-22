/**
 * SecureDrop File Upload SDK
 * 
 * A comprehensive file validation and upload SDK that can be used
 * in both frontend and backend environments.
 * 
 * Features:
 * - File validation (size, MIME type, magic bytes)
 * - Hash generation for integrity verification
 * - Configuration-based validation rules
 * - Frontend-agnostic validation logic
 * - Backend utilities for storage integration
 */

// Re-export main validation components
export { 
  FileValidator, 
  DEFAULT_CONFIGS,
  type FileValidationConfig,
  type ValidationResult,
  type FileMetadata 
} from '../lib/file-validator';

// Frontend-specific components
export { CustomDropZone } from '../components/upload/CustomDropZone';
export { UploadConfigDashboard } from '../components/admin/UploadConfigDashboard';

// Utility functions for common operations
export * from './utils';
export * from './types';
export * from './backend-utils';