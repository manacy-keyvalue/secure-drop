# 🛡️ SecureDrop - Enterprise-Grade Secure File Upload Platform

**A pluggable, security-first file upload toolkit for modern applications**

SecureDrop is a comprehensive, enterprise-ready file upload solution that combines deep security scanning, compliance features, and developer-friendly APIs into a single, powerful platform.

![SecureDrop Banner](https://img.shields.io/badge/SecureDrop-Enterprise%20Security-blue?style=for-the-badge&logo=shield)

## 🌟 Key Features

### 🔐 Advanced Security Engine

- **Multi-layer Threat Detection**: Magic byte validation, MIME spoofing detection, injection pattern scanning
- **Virus Scanning**: Integrated ClamAV support and pluggable antivirus APIs
- **YARA Rules**: Custom malware signature detection
- **Content Analysis**: Deep file structure analysis and anomaly detection
- **Behavioral Sandboxing**: Optional file execution monitoring (configurable)

### ⚙️ Admin-Configurable Constraints

- **Multiple Configuration Profiles**: Different rules for different use cases
- **Dynamic File Type Controls**: MIME type and extension validation
- **Regex Pattern Matching**: Custom filename validation rules
- **Size & Quantity Limits**: Configurable per user/group
- **Auto-expiry**: Automatic file cleanup after configurable periods

### 📦 Developer-Friendly Integration

- **React 19 Compatible**: Drop-in component for React applications
- **Framework Agnostic**: Works with Vue, Angular, and vanilla JS
- **Backend SDKs**: Node.js, Express, FastAPI integration examples
- **Lifecycle Hooks**: Customizable upload pipeline with middleware support
- **TypeScript First**: Full type safety and IntelliSense support

### 📊 Enterprise Observability

- **Real-time Analytics**: Upload statistics and threat intelligence
- **Audit Trails**: Complete GDPR/HIPAA/SOC2 compliance logging
- **Device Fingerprinting**: Track upload sources for security analysis
- **Webhook Integration**: Real-time notifications for security events
- **Export Capabilities**: CSV/JSON audit log exports

### 🔒 Compliance & Security Standards

- **GDPR Compliance**: Automatic data expiry and deletion controls
- **HIPAA Ready**: Encrypted storage and access controls
- **SOC2 Compatible**: Comprehensive audit logging
- **OWASP Top 10**: Protection against common web vulnerabilities

## 🚀 Quick Start

### Installation

```bash
npm install @securedrop/core @securedrop/react
# or
yarn add @securedrop/core @securedrop/react
```

### Basic React Integration

```tsx
import { SecureDropWrapper } from "@securedrop/react";

function App() {
  return (
    <SecureDropWrapper
      maxFiles={10}
      maxFileSize={10 * 1024 * 1024} // 10MB
      securityLevel="moderate"
      allowedTypes={["image/*", "application/pdf", "text/*"]}
      onUploadComplete={(files) => {
        console.log("Successfully uploaded:", files);
      }}
      onThreatDetected={(file, threats) => {
        console.warn("Security threat detected:", threats);
      }}
    />
  );
}
```

### Backend Integration (Express.js)

```typescript
import { SecureDropAPI, SECURITY_CONFIGS } from "@securedrop/backend";

const secureDropAPI = new SecureDropAPI(
  {
    // Lifecycle hooks
    beforeUpload: async (file, metadata) => {
      console.log(`Uploading ${file.name} from ${metadata.ipAddress}`);
      return true; // Allow upload
    },
    afterScan: async (file, scanResult) => {
      if (!scanResult.isClean) {
        console.warn(`Threats found in ${file.name}:`, scanResult.threats);
      }
    },
  },
  SECURITY_CONFIGS.STRICT
);

app.post("/api/upload", async (req, res) => {
  try {
    const result = await secureDropAPI.uploadFile(req.file, {
      bucketName: "secure-uploads",
      expiryHours: 72,
      requireScan: true,
      generateThumbnails: true,
    });

    res.json({ success: true, file: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## 🔧 CLI Tools

SecureDrop includes powerful CLI tools for development and testing:

```bash
# Generate mock files for testing
npx securedrop-cli generate-mock --type malicious --count 10 --output ./test-files

# Scan existing files for threats
npx securedrop-cli scan ./uploads --level strict --output security-report.json

# Test configuration with sample files
npx securedrop-cli test-config --config ./my-config.json

# Generate framework integration examples
npx securedrop-cli generate-examples --framework react --output ./examples

# Run performance benchmarks
npx securedrop-cli benchmark --files 1000 --size 5 --threads 8

# Initialize configuration templates
npx securedrop-cli init-config --type strict --output production-config.json
```

## 📋 Configuration Profiles

Create multiple upload profiles for different use cases:

```json
{
  "profile_name": "strict-documents",
  "description": "High-security document uploads",
  "max_file_size": 5242880,
  "allowed_mime_types": ["application/pdf", "text/*"],
  "blocked_extensions": ["exe", "bat", "cmd", "scr", "vbs", "js"],
  "filename_pattern": "^[a-zA-Z0-9._-]+$",
  "security_level": "strict",
  "virus_scanning_enabled": true,
  "injection_detection_enabled": true,
  "yara_scanning_enabled": true,
  "require_watermark": true,
  "webhook_url": "https://api.yourapp.com/webhooks/securedrop"
}
```

## 🔍 Security Features Deep Dive

### Advanced Threat Detection

```typescript
const scanner = new SecurityScanner({
  enableVirusScanning: true,
  enableInjectionDetection: true,
  enableYaraScanning: true,
  customSignatures: [
    {
      name: "Custom Malware Pattern",
      pattern: /malicious_pattern_here/gi,
      severity: "critical",
      description: "Detects custom malware signatures",
    },
  ],
  suspiciousPatterns: [
    /eval\s*\(\s*unescape/gi,
    /<script[^>]*>.*?<\/script>/gi,
  ],
});

const result = await scanner.scanFile(file);
console.log(`File is ${result.isClean ? "clean" : "infected"}`);
console.log(`Confidence: ${result.confidence * 100}%`);
console.log(`Threats:`, result.threats);
```

### File Validation Pipeline

```typescript
const validator = new FileValidator({
  maxFileSize: 10 * 1024 * 1024,
  allowedMimeTypes: ["image/*", "application/pdf"],
  allowedExtensions: ["jpg", "jpeg", "png", "pdf"],
  maxFiles: 5,
  requireHash: true,
});

const validation = await validator.validateFile(file);
if (!validation.isValid) {
  console.error("Validation failed:", validation.errors);
}
```

## 📊 Admin Dashboard

The enhanced admin dashboard provides:

- **Multiple Security Profiles**: Create and manage different upload configurations
- **Real-time Analytics**: Monitor upload patterns and security events
- **Threat Intelligence**: View detected threats and attack patterns
- **Audit Logging**: Complete compliance trail with export capabilities
- **Configuration Testing**: Test regex patterns and validation rules
- **Webhook Management**: Configure real-time notifications

![Admin Dashboard](docs/admin-dashboard-preview.png)

## 🛠️ Advanced Usage

### Custom Storage Backend

```typescript
import { StorageBackend } from "@securedrop/backend";

class CustomS3Storage implements StorageBackend {
  name = "custom-s3";

  async upload(file: File, path: string): Promise<string> {
    // Your S3 upload logic
    return uploadedPath;
  }

  async download(path: string): Promise<Blob> {
    // Your S3 download logic
    return blob;
  }
}

const api = new SecureDropAPI(hooks, securityConfig);
api.setStorageBackend(new CustomS3Storage());
```

### Lifecycle Hooks

```typescript
const hooks: LifecycleHooks = {
  beforeUpload: async (file, metadata) => {
    // Custom validation logic
    if (file.size > 50 * 1024 * 1024) return false;
    return true;
  },

  afterValidation: async (file, result) => {
    // Log validation results
    await logValidation(file.name, result);
  },

  afterScan: async (file, scanResult) => {
    // Send threat alerts
    if (!scanResult.isClean) {
      await sendThreatAlert(file, scanResult.threats);
    }
  },

  afterStore: async (uploadResult) => {
    // Post-upload processing
    await processUploadedFile(uploadResult);
  },
};
```

## 🧪 Testing & Development

### Mock Data Generation

```bash
# Generate test files with known threats
securedrop-cli generate-mock --type malicious --count 50

# Generate clean test files
securedrop-cli generate-mock --type image --count 20
securedrop-cli generate-mock --type pdf --count 10
```

### Security Testing

```typescript
import { TestingUtils } from "@securedrop/testing";

// Test with known attack vectors
const attackVectors = TestingUtils.generateAttackVectors();
for (const vector of attackVectors) {
  const result = await scanner.scanFile(vector.file);
  expect(result.isClean).toBe(false);
  expect(result.threats).toContainEqual(
    expect.objectContaining({ name: vector.expectedThreat })
  );
}
```

## 🚢 Deployment

### Environment Configuration

```bash
# Production settings
SECUREDROP_SECURITY_LEVEL=strict
SECUREDROP_VIRUS_SCANNER_URL=http://clamav:3310
SECUREDROP_STORAGE_BACKEND=s3
SECUREDROP_S3_BUCKET=production-uploads
SECUREDROP_WEBHOOK_SECRET=your-webhook-secret
```

### Docker Deployment

```dockerfile
FROM node:19-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Performance

Benchmark results on modern hardware:

- **File Validation**: ~500 files/second
- **Security Scanning**: ~100 MB/minute
- **Throughput**: 50+ concurrent uploads
- **Memory Usage**: <100MB for typical workloads

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/your-org/securedrop
cd securedrop
npm install
npm run dev

# Run tests
npm test

# Run security scans
npm run security-check
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🛡️ Security Policy

If you discover a security vulnerability, please email security@securedrop.dev instead of using the issue tracker.

## 📚 Documentation

- [API Reference](docs/api-reference.md)
- [Security Guide](docs/security-guide.md)
- [Integration Examples](docs/examples/)
- [CLI Reference](docs/cli-reference.md)
- [Migration Guide](docs/migration.md)

## 🔗 Links

- [Live Demo](https://demo.securedrop.dev)
- [Documentation](https://docs.securedrop.dev)
- [Community Forum](https://community.securedrop.dev)
- [Status Page](https://status.securedrop.dev)

---

**SecureDrop** - Making file uploads secure by default. 🛡️

[![npm version](https://badge.fury.io/js/@securedrop%2Fcore.svg)](https://www.npmjs.com/package/@securedrop/core)
[![Security Rating](https://img.shields.io/badge/security-A+-green)](https://securityheaders.com/?q=https://demo.securedrop.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
