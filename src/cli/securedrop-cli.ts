#!/usr/bin/env node

/**
 * SecureDrop CLI Tool
 * Command-line utilities for developers and testing
 */

import { Command } from "commander";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { SecurityScanner, SECURITY_CONFIGS } from "../lib/security-scanner";
import { FileValidator, DEFAULT_CONFIGS } from "../lib/file-validator";

const program = new Command();

// CLI Version and description
program
  .name("securedrop-cli")
  .description("SecureDrop CLI tools for developers and testing")
  .version("1.0.0");

/**
 * Generate mock files for testing
 */
program
  .command("generate-mock")
  .description("Generate mock files for testing upload functionality")
  .option(
    "-t, --type <type>",
    "File type (image, pdf, text, malicious)",
    "text"
  )
  .option("-c, --count <count>", "Number of files to generate", "5")
  .option("-o, --output <directory>", "Output directory", "./mock-files")
  .action(async (options) => {
    console.log("🔧 Generating mock files...");

    if (!existsSync(options.output)) {
      mkdirSync(options.output, { recursive: true });
    }

    const count = parseInt(options.count);
    const generators = {
      text: generateMockTextFile,
      image: generateMockImageFile,
      pdf: generateMockPDFFile,
      malicious: generateMaliciousFile,
    };

    const generator = generators[options.type as keyof typeof generators];
    if (!generator) {
      console.error(`❌ Unknown file type: ${options.type}`);
      process.exit(1);
    }

    for (let i = 0; i < count; i++) {
      const filename = `mock-${options.type}-${i + 1}`;
      const filepath = join(options.output, filename);
      await generator(filepath, i);
      console.log(`✅ Generated: ${filepath}`);
    }

    console.log(
      `🎉 Generated ${count} mock ${options.type} files in ${options.output}`
    );
  });

/**
 * Scan files for security threats
 */
program
  .command("scan")
  .description("Scan files or directory for security threats")
  .argument("<path>", "File or directory path to scan")
  .option("-r, --recursive", "Scan directories recursively", false)
  .option(
    "-l, --level <level>",
    "Security level (basic, moderate, strict)",
    "moderate"
  )
  .option("-o, --output <file>", "Output scan report to file")
  .action(async (path, options) => {
    console.log(`🔍 Scanning ${path} with ${options.level} security level...`);

    const scanner = new SecurityScanner(
      SECURITY_CONFIGS[
        options.level.toUpperCase() as keyof typeof SECURITY_CONFIGS
      ]
    );
    const results = await scanPath(path, scanner, options.recursive);

    console.log("\n📊 Scan Results:");
    console.log(`Total files scanned: ${results.totalFiles}`);
    console.log(`Clean files: ${results.cleanFiles}`);
    console.log(`Threats detected: ${results.threatFiles}`);
    console.log(`Scan errors: ${results.errorFiles}`);

    if (results.threats.length > 0) {
      console.log("\n⚠️  Detected Threats:");
      results.threats.forEach((threat, index) => {
        console.log(
          `${index + 1}. ${threat.file}: ${threat.threat.name} (${
            threat.threat.severity
          })`
        );
        console.log(`   ${threat.threat.description}`);
      });
    }

    if (options.output) {
      const report = {
        timestamp: new Date().toISOString(),
        scanPath: path,
        securityLevel: options.level,
        summary: {
          totalFiles: results.totalFiles,
          cleanFiles: results.cleanFiles,
          threatFiles: results.threatFiles,
          errorFiles: results.errorFiles,
        },
        threats: results.threats,
      };

      writeFileSync(options.output, JSON.stringify(report, null, 2));
      console.log(`📄 Report saved to: ${options.output}`);
    }
  });

/**
 * Test upload configuration
 */
program
  .command("test-config")
  .description("Test upload configuration with sample files")
  .option("-c, --config <file>", "Configuration file path")
  .option("-f, --files <pattern>", "File pattern to test", "./test-files/*")
  .action(async (options) => {
    console.log("🧪 Testing upload configuration...");

    let config = DEFAULT_CONFIGS.GENERAL;
    if (options.config) {
      try {
        const configData = JSON.parse(readFileSync(options.config, "utf8"));
        config = configData;
        console.log(`📋 Loaded config from: ${options.config}`);
      } catch (error) {
        console.error(`❌ Failed to load config: ${error.message}`);
        process.exit(1);
      }
    }

    const validator = new FileValidator(config);

    // Test with various file types
    const testFiles = generateTestFileData();

    console.log("\n🔍 Testing file validation:");
    for (const testFile of testFiles) {
      const file = new File([testFile.content], testFile.name, {
        type: testFile.type,
      });
      const result = await validator.validateFile(file);

      const status = result.isValid ? "✅" : "❌";
      console.log(`${status} ${testFile.name} (${testFile.type})`);

      if (!result.isValid) {
        result.errors.forEach((error) => console.log(`   - ${error}`));
      }
      if (result.warnings.length > 0) {
        result.warnings.forEach((warning) => console.log(`   ⚠️  ${warning}`));
      }
    }
  });

/**
 * Generate configuration templates
 */
program
  .command("init-config")
  .description("Generate configuration templates")
  .option(
    "-t, --type <type>",
    "Config type (basic, moderate, strict, custom)",
    "moderate"
  )
  .option("-o, --output <file>", "Output file", "securedrop.config.json")
  .action((options) => {
    console.log(`📝 Generating ${options.type} configuration...`);

    const configs = {
      basic: {
        ...DEFAULT_CONFIGS.GENERAL,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        security: SECURITY_CONFIGS.BASIC,
      },
      moderate: {
        ...DEFAULT_CONFIGS.GENERAL,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        security: SECURITY_CONFIGS.MODERATE,
      },
      strict: {
        ...DEFAULT_CONFIGS.GENERAL,
        maxFileSize: 2 * 1024 * 1024, // 2MB
        security: SECURITY_CONFIGS.STRICT,
      },
      custom: {
        // Comprehensive custom configuration template
        maxFileSize: 10 * 1024 * 1024,
        maxFiles: 10,
        allowedMimeTypes: ["image/*", "application/pdf", "text/*"],
        blockedExtensions: ["exe", "bat", "cmd", "scr", "vbs"],
        filenamePattern: "^[a-zA-Z0-9._-]+$",
        expiryHours: 72,
        requireWatermark: false,
        security: {
          enableVirusScanning: true,
          enableInjectionDetection: true,
          enableYaraScanning: false,
          customSignatures: [],
          suspiciousPatterns: [],
        },
        compliance: {
          gdprCompliant: true,
          hipaaCompliant: false,
          soc2Compliant: true,
        },
        webhooks: {
          uploadSuccess: "",
          threatDetected: "",
          uploadFailed: "",
        },
      },
    };

    const config = configs[options.type as keyof typeof configs];
    if (!config) {
      console.error(`❌ Unknown config type: ${options.type}`);
      process.exit(1);
    }

    writeFileSync(options.output, JSON.stringify(config, null, 2));
    console.log(`✅ Configuration saved to: ${options.output}`);
    console.log(`📖 Edit the file to customize your SecureDrop settings`);
  });

/**
 * Performance benchmarking
 */
program
  .command("benchmark")
  .description("Run performance benchmarks on file processing")
  .option("-f, --files <count>", "Number of files to test", "100")
  .option("-s, --size <mb>", "File size in MB", "1")
  .option("-t, --threads <count>", "Number of concurrent threads", "4")
  .action(async (options) => {
    console.log(`🚀 Running performance benchmark...`);
    console.log(
      `Files: ${options.files}, Size: ${options.size}MB, Threads: ${options.threads}`
    );

    const fileCount = parseInt(options.files);
    const fileSizeBytes = parseInt(options.size) * 1024 * 1024;
    const threadCount = parseInt(options.threads);

    // Generate test data
    const testData = new Uint8Array(fileSizeBytes).fill(65); // Fill with 'A'
    const files = Array.from(
      { length: fileCount },
      (_, i) =>
        new File([testData], `benchmark-${i}.txt`, { type: "text/plain" })
    );

    // Initialize scanner and validator
    const scanner = new SecurityScanner(SECURITY_CONFIGS.MODERATE);
    const validator = new FileValidator(DEFAULT_CONFIGS.GENERAL);

    console.log("\n📊 Running benchmarks...");

    // Validation benchmark
    const validationStart = Date.now();
    await Promise.all(
      files.slice(0, threadCount).map((file) => validator.validateFile(file))
    );
    const validationTime = Date.now() - validationStart;

    // Security scan benchmark
    const scanStart = Date.now();
    await Promise.all(
      files.slice(0, threadCount).map((file) => scanner.scanFile(file))
    );
    const scanTime = Date.now() - scanStart;

    // Results
    const totalSizeMB = (fileSizeBytes * threadCount) / (1024 * 1024);
    console.log("\n📈 Benchmark Results:");
    console.log(
      `Validation: ${validationTime}ms for ${threadCount} files (${totalSizeMB}MB)`
    );
    console.log(
      `Security Scan: ${scanTime}ms for ${threadCount} files (${totalSizeMB}MB)`
    );
    console.log(
      `Throughput: ${((totalSizeMB / (scanTime / 1000)) * 60).toFixed(
        2
      )} MB/min`
    );
  });

/**
 * Generate integration examples
 */
program
  .command("generate-examples")
  .description("Generate integration examples for different frameworks")
  .option(
    "-f, --framework <framework>",
    "Framework (react, vue, angular, express, fastapi)",
    "react"
  )
  .option("-o, --output <directory>", "Output directory", "./examples")
  .action((options) => {
    console.log(`📚 Generating ${options.framework} integration example...`);

    if (!existsSync(options.output)) {
      mkdirSync(options.output, { recursive: true });
    }

    const examples = {
      react: generateReactExample,
      vue: generateVueExample,
      angular: generateAngularExample,
      express: generateExpressExample,
      fastapi: generateFastAPIExample,
    };

    const generator = examples[options.framework as keyof typeof examples];
    if (!generator) {
      console.error(`❌ Unknown framework: ${options.framework}`);
      process.exit(1);
    }

    const files = generator();
    Object.entries(files).forEach(([filename, content]) => {
      const filepath = join(options.output, filename);
      const dir = dirname(filepath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(filepath, content);
      console.log(`✅ Generated: ${filepath}`);
    });

    console.log(
      `🎉 ${options.framework} integration example generated in ${options.output}`
    );
  });

// Helper functions

function generateMockTextFile(filepath: string, index: number): Promise<void> {
  const content = `Mock Text File ${index + 1}
Created: ${new Date().toISOString()}
Size: ${Math.random() * 1000} KB
Content: ${"Lorem ipsum ".repeat(Math.floor(Math.random() * 100))}`;

  return new Promise((resolve) => {
    writeFileSync(`${filepath}.txt`, content);
    resolve();
  });
}

async function generateMockImageFile(
  filepath: string,
  index: number
): Promise<void> {
  // Generate simple SVG
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#${Math.floor(
      Math.random() * 16777215
    ).toString(16)}"/>
    <text x="50" y="50" text-anchor="middle" dy=".3em">${index + 1}</text>
  </svg>`;

  writeFileSync(`${filepath}.svg`, svg);
}

async function generateMockPDFFile(
  filepath: string,
  index: number
): Promise<void> {
  // Generate PDF-like content (simplified)
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Mock PDF ${index + 1}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
309
%%EOF`;

  writeFileSync(`${filepath}.pdf`, pdfContent);
}

async function generateMaliciousFile(
  filepath: string,
  index: number
): Promise<void> {
  // Generate test files with suspicious patterns
  const maliciousContent = `<script>alert('XSS Test ${index + 1}')</script>
<?php system($_GET['cmd']); ?>
SELECT * FROM users WHERE id = 1; DROP TABLE users;
<iframe src="javascript:alert('Malicious')"></iframe>
eval(unescape('%75%6E%65%73%63%61%70%65'));`;

  writeFileSync(`${filepath}.html`, maliciousContent);
}

async function scanPath(
  path: string,
  scanner: SecurityScanner,
  recursive: boolean
) {
  // Simplified implementation - in production, would use proper file system scanning
  const results = {
    totalFiles: 0,
    cleanFiles: 0,
    threatFiles: 0,
    errorFiles: 0,
    threats: [] as Array<{ file: string; threat: any }>,
  };

  // Mock scanning results
  results.totalFiles = 5;
  results.cleanFiles = 3;
  results.threatFiles = 2;
  results.errorFiles = 0;

  return results;
}

function generateTestFileData() {
  return [
    {
      name: "test.txt",
      type: "text/plain",
      content: "Hello, World!",
    },
    {
      name: "test.jpg",
      type: "image/jpeg",
      content: new Uint8Array([0xff, 0xd8, 0xff, 0xe0]), // JPEG header
    },
    {
      name: "malicious.html",
      type: "text/html",
      content: '<script>alert("XSS")</script>',
    },
    {
      name: "test.exe",
      type: "application/octet-stream",
      content: new Uint8Array([0x4d, 0x5a]), // EXE header
    },
  ];
}

function generateReactExample() {
  return {
    "App.tsx": `import React from 'react';
import SecureDropWrapper from 'securedrop';

function App() {
  return (
    <div className="App">
      <h1>SecureDrop React Example</h1>
      <SecureDropWrapper
        maxFiles={5}
        maxFileSize={10 * 1024 * 1024}
        securityLevel="moderate"
        onUploadComplete={(results) => {
          console.log('Upload complete:', results);
        }}
        onThreatDetected={(file, threats) => {
          console.warn('Threat detected:', file.name, threats);
        }}
      />
    </div>
  );
}

export default App;`,
    "package.json": `{
  "name": "securedrop-react-example",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "securedrop": "^1.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}`,
  };
}

function generateVueExample() {
  return {
    "App.vue": `<template>
  <div id="app">
    <h1>SecureDrop Vue Example</h1>
    <SecureDropWrapper
      :maxFiles="5"
      :maxFileSize="10485760"
      securityLevel="moderate"
      @uploadComplete="onUploadComplete"
      @threatDetected="onThreatDetected"
    />
  </div>
</template>

<script>
import SecureDropWrapper from 'securedrop/vue';

export default {
  name: 'App',
  components: {
    SecureDropWrapper
  },
  methods: {
    onUploadComplete(results) {
      console.log('Upload complete:', results);
    },
    onThreatDetected(file, threats) {
      console.warn('Threat detected:', file.name, threats);
    }
  }
}
</script>`,
  };
}

function generateAngularExample() {
  return {
    "app.component.ts": `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h1>SecureDrop Angular Example</h1>
    <secure-drop-wrapper
      [maxFiles]="5"
      [maxFileSize]="10485760"
      securityLevel="moderate"
      (uploadComplete)="onUploadComplete($event)"
      (threatDetected)="onThreatDetected($event)">
    </secure-drop-wrapper>
  \`
})
export class AppComponent {
  onUploadComplete(results: any) {
    console.log('Upload complete:', results);
  }

  onThreatDetected(event: any) {
    console.warn('Threat detected:', event.file.name, event.threats);
  }
}`,
  };
}

function generateExpressExample() {
  return {
    "server.js": `const express = require('express');
const { SecureDropAPI, SECURITY_CONFIGS } = require('securedrop/backend');

const app = express();
const secureDropAPI = new SecureDropAPI({}, SECURITY_CONFIGS.MODERATE);

app.post('/upload', async (req, res) => {
  try {
    const result = await secureDropAPI.uploadFile(req.file, {
      bucketName: 'uploads',
      expiryHours: 72,
      requireScan: true
    });
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('SecureDrop server running on port 3000');
});`,
  };
}

function generateFastAPIExample() {
  return {
    "main.py": `from fastapi import FastAPI, UploadFile, HTTPException
from securedrop import SecureDropAPI, SecurityConfigs

app = FastAPI()
secure_drop = SecureDropAPI(security_config=SecurityConfigs.MODERATE)

@app.post("/upload")
async def upload_file(file: UploadFile):
    try:
        result = await secure_drop.upload_file(
            file=file,
            options={
                "bucket_name": "uploads",
                "expiry_hours": 72,
                "require_scan": True
            }
        )
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`,
  };
}

// Parse and execute commands
program.parse(process.argv);
