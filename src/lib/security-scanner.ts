/**
 * Advanced Security Scanning Engine for SecureDrop
 * Comprehensive file security analysis with multiple detection layers
 */

import { FileValidator, ValidationResult } from "./file-validator";

export interface SecurityScanConfig {
  enableVirusScanning: boolean;
  enableInjectionDetection: boolean;
  enableYaraScanning: boolean;
  enableSandboxing: boolean;
  virusScannerEndpoint?: string;
  yaraRules?: string[];
  customSignatures?: SecuritySignature[];
  suspiciousPatterns?: RegExp[];
}

export interface SecuritySignature {
  name: string;
  pattern: RegExp;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
}

export interface SecurityScanResult {
  isClean: boolean;
  threats: SecurityThreat[];
  scanTime: number;
  scanner: string;
  confidence: number;
  quarantined: boolean;
}

export interface SecurityThreat {
  type: "virus" | "malware" | "injection" | "suspicious_content" | "yara_match";
  name: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  signature?: string;
  offset?: number;
}

export class SecurityScanner {
  private config: SecurityScanConfig;
  private defaultSignatures: SecuritySignature[];

  constructor(config: SecurityScanConfig) {
    this.config = config;
    this.defaultSignatures = this.initializeDefaultSignatures();
  }

  /**
   * Perform comprehensive security scan on file
   */
  async scanFile(file: File): Promise<SecurityScanResult> {
    const startTime = Date.now();
    const threats: SecurityThreat[] = [];
    let isClean = true;
    let confidence = 1.0;

    try {
      // 1. Magic byte and MIME validation
      const mimeThreats = await this.validateMimeAndMagicBytes(file);
      threats.push(...mimeThreats);

      // 2. Content-based injection detection
      if (this.config.enableInjectionDetection) {
        const injectionThreats = await this.detectInjectionPatterns(file);
        threats.push(...injectionThreats);
      }

      // 3. YARA rules scanning
      if (this.config.enableYaraScanning && this.config.yaraRules) {
        const yaraThreats = await this.scanWithYaraRules(file);
        threats.push(...yaraThreats);
      }

      // 4. Custom signature scanning
      const customThreats = await this.scanCustomSignatures(file);
      threats.push(...customThreats);

      // 5. Virus scanning (external API or ClamAV)
      if (this.config.enableVirusScanning) {
        const virusThreats = await this.scanForViruses(file);
        threats.push(...virusThreats);
      }

      // 6. Advanced file structure analysis
      const structuralThreats = await this.analyzeFileStructure(file);
      threats.push(...structuralThreats);

      // Determine overall security status
      const criticalThreats = threats.filter((t) => t.severity === "critical");
      const highThreats = threats.filter((t) => t.severity === "high");

      isClean = criticalThreats.length === 0 && highThreats.length === 0;
      confidence = Math.max(0, 1 - threats.length * 0.1);

      return {
        isClean,
        threats,
        scanTime: Date.now() - startTime,
        scanner: "SecureDrop Security Engine v1.0",
        confidence,
        quarantined: !isClean,
      };
    } catch (error) {
      console.error("Security scan error:", error);
      return {
        isClean: false,
        threats: [
          {
            type: "suspicious_content",
            name: "Scan Error",
            severity: "medium",
            description: "Could not complete security scan",
          },
        ],
        scanTime: Date.now() - startTime,
        scanner: "SecureDrop Security Engine v1.0",
        confidence: 0,
        quarantined: true,
      };
    }
  }

  /**
   * Enhanced MIME type and magic byte validation
   */
  private async validateMimeAndMagicBytes(
    file: File
  ): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];

    try {
      const buffer = await file.slice(0, 64).arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Check for executable file signatures
      const executableSignatures = [
        {
          signature: [0x4d, 0x5a],
          name: "Windows PE Executable",
          severity: "critical" as const,
        },
        {
          signature: [0x7f, 0x45, 0x4c, 0x46],
          name: "Linux ELF Executable",
          severity: "critical" as const,
        },
        {
          signature: [0xfe, 0xed, 0xfa, 0xce],
          name: "Mach-O Executable",
          severity: "critical" as const,
        },
        {
          signature: [0xca, 0xfe, 0xba, 0xbe],
          name: "Java Class File",
          severity: "high" as const,
        },
        {
          signature: [0x50, 0x4b, 0x03, 0x04],
          name: "ZIP Archive (potential)",
          severity: "medium" as const,
        },
      ];

      for (const sig of executableSignatures) {
        if (this.matchesSignature(bytes, sig.signature)) {
          // Allow ZIP files if they're expected archive types
          if (
            sig.name === "ZIP Archive (potential)" &&
            (file.type === "application/zip" ||
              file.type === "application/x-zip-compressed" ||
              file.name.toLowerCase().endsWith(".zip"))
          ) {
            continue;
          }

          threats.push({
            type: "suspicious_content",
            name: sig.name,
            severity: sig.severity,
            description: `File contains ${sig.name} signature but is disguised as ${file.type}`,
          });
        }
      }

      // Check for script injections in file headers
      const headerText = new TextDecoder("utf-8", { fatal: false }).decode(
        bytes
      );
      const scriptPatterns = [
        /<script[^>]*>/i,
        /javascript:/i,
        /vbscript:/i,
        /on\w+\s*=/i,
        /<iframe[^>]*>/i,
        /<embed[^>]*>/i,
        /<object[^>]*>/i,
      ];

      for (const pattern of scriptPatterns) {
        if (pattern.test(headerText)) {
          threats.push({
            type: "injection",
            name: "Script Injection",
            severity: "high",
            description: "File contains potentially malicious script code",
          });
          break;
        }
      }
    } catch (error) {
      // Ignore decode errors for binary files
    }

    return threats;
  }

  /**
   * Detect injection patterns in file content
   */
  private async detectInjectionPatterns(file: File): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];

    try {
      // Read file content as text for pattern matching
      const text = await file.text();

      const injectionPatterns = [
        {
          pattern:
            /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b).*(\bFROM\b|\bWHERE\b|\bINTO\b)/gi,
          name: "SQL Injection",
          severity: "high" as const,
          description: "File contains potential SQL injection patterns",
        },
        {
          pattern: /<\s*script[^>]*>.*?<\/\s*script\s*>/gi,
          name: "Cross-Site Scripting (XSS)",
          severity: "high" as const,
          description:
            "File contains script tags that could execute malicious code",
        },
        {
          pattern:
            /(\beval\b|\bexec\b|\bsystem\b|\bshell_exec\b|\bpassthru\b)\s*\(/gi,
          name: "Code Injection",
          severity: "critical" as const,
          description: "File contains code execution functions",
        },
        {
          pattern: /(\$\{|\#\{).*\}/g,
          name: "Template Injection",
          severity: "medium" as const,
          description: "File contains template injection patterns",
        },
        {
          pattern: /(cmd\.exe|powershell|bash|sh)\s+[\/\-]/gi,
          name: "Command Injection",
          severity: "high" as const,
          description: "File contains command execution patterns",
        },
      ];

      for (const {
        pattern,
        name,
        severity,
        description,
      } of injectionPatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          threats.push({
            type: "injection",
            name,
            severity,
            description: `${description} (${matches.length} matches found)`,
          });
        }
      }

      // Check for suspicious patterns in custom configuration
      if (this.config.suspiciousPatterns) {
        for (const pattern of this.config.suspiciousPatterns) {
          if (pattern.test(text)) {
            threats.push({
              type: "suspicious_content",
              name: "Custom Pattern Match",
              severity: "medium",
              description: "File matches custom suspicious pattern",
            });
          }
        }
      }
    } catch (error) {
      // File is likely binary, skip text-based injection detection
    }

    return threats;
  }

  /**
   * Scan with YARA rules (simplified implementation)
   */
  private async scanWithYaraRules(file: File): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];

    if (!this.config.yaraRules) return threats;

    try {
      const buffer = await file.arrayBuffer();
      const content = new Uint8Array(buffer);

      // Simplified YARA-like rule matching
      for (const rule of this.config.yaraRules) {
        // This is a simplified implementation
        // In production, you'd use a proper YARA engine
        if (this.matchesYaraRule(content, rule)) {
          threats.push({
            type: "yara_match",
            name: `YARA Rule: ${rule}`,
            severity: "high",
            description: `File matches YARA rule: ${rule}`,
          });
        }
      }
    } catch (error) {
      console.error("YARA scanning error:", error);
    }

    return threats;
  }

  /**
   * Scan for custom security signatures
   */
  private async scanCustomSignatures(file: File): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];

    try {
      const text = await file.text();
      const allSignatures = [
        ...this.defaultSignatures,
        ...(this.config.customSignatures || []),
      ];

      for (const signature of allSignatures) {
        if (signature.pattern.test(text)) {
          threats.push({
            type: "suspicious_content",
            name: signature.name,
            severity: signature.severity,
            description: signature.description,
            signature: signature.pattern.toString(),
          });
        }
      }
    } catch (error) {
      // Handle binary files that can't be read as text
    }

    return threats;
  }

  /**
   * Virus scanning using external API or ClamAV
   */
  private async scanForViruses(file: File): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];

    if (!this.config.virusScannerEndpoint) {
      return threats;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(this.config.virusScannerEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Virus scan failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.clean && result.threats) {
        for (const threat of result.threats) {
          threats.push({
            type: "virus",
            name: threat.name || "Unknown Virus",
            severity: "critical",
            description: threat.description || "Virus detected by scanner",
          });
        }
      }
    } catch (error) {
      console.error("Virus scanning failed:", error);
      // Don't fail the entire scan if virus scanning fails
    }

    return threats;
  }

  /**
   * Analyze file structure for anomalies
   */
  private async analyzeFileStructure(file: File): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];

    // Check for suspicious file size patterns
    if (file.size === 0) {
      threats.push({
        type: "suspicious_content",
        name: "Empty File",
        severity: "low",
        description: "File is empty which may be suspicious",
      });
    }

    // Check for files with misleading extensions
    const extension = file.name.split(".").pop()?.toLowerCase();
    const mimeType = file.type;

    const suspiciousCombinations = [
      { ext: "txt", mime: "application/octet-stream" },
      { ext: "jpg", mime: "text/html" },
      { ext: "png", mime: "text/javascript" },
      { ext: "pdf", mime: "text/html" },
    ];

    for (const combo of suspiciousCombinations) {
      if (extension === combo.ext && mimeType === combo.mime) {
        threats.push({
          type: "suspicious_content",
          name: "MIME Type Mismatch",
          severity: "medium",
          description: `File extension ${extension} doesn't match MIME type ${mimeType}`,
        });
      }
    }

    return threats;
  }

  /**
   * Helper methods
   */
  private matchesSignature(bytes: Uint8Array, signature: number[]): boolean {
    if (bytes.length < signature.length) return false;
    return signature.every((byte, index) => bytes[index] === byte);
  }

  private matchesYaraRule(content: Uint8Array, rule: string): boolean {
    // Simplified YARA rule matching
    // In a real implementation, you'd use a proper YARA parser
    return rule.includes("malware") && content.length > 0;
  }

  private initializeDefaultSignatures(): SecuritySignature[] {
    return [
      {
        name: "Base64 Encoded Executable",
        pattern: /TVqQAAMAAAAEAAAA/g, // MZ header in base64
        severity: "high",
        description: "File contains base64 encoded executable",
      },
      {
        name: "Suspicious PowerShell",
        pattern: /(Invoke-Expression|IEX|DownloadString|EncodedCommand)/gi,
        severity: "high",
        description: "File contains suspicious PowerShell commands",
      },
      {
        name: "Obfuscated JavaScript",
        pattern:
          /eval\s*\(\s*unescape\s*\(|String\.fromCharCode|\\x[0-9a-f]{2}/gi,
        severity: "medium",
        description: "File contains obfuscated JavaScript",
      },
      {
        name: "Suspicious Registry Access",
        pattern:
          /HKEY_(LOCAL_MACHINE|CURRENT_USER)\\Software\\Microsoft\\Windows\\CurrentVersion\\Run/gi,
        severity: "high",
        description: "File contains registry autostart entries",
      },
    ];
  }
}

/**
 * Default security scanner configurations
 */
export const SECURITY_CONFIGS = {
  STRICT: {
    enableVirusScanning: true,
    enableInjectionDetection: true,
    enableYaraScanning: true,
    enableSandboxing: false,
    yaraRules: ["malware.yar", "suspicious.yar"],
  } as SecurityScanConfig,
  MODERATE: {
    enableVirusScanning: true,
    enableInjectionDetection: true,
    enableYaraScanning: false,
    enableSandboxing: false,
  } as SecurityScanConfig,
  BASIC: {
    enableVirusScanning: false,
    enableInjectionDetection: true,
    enableYaraScanning: false,
    enableSandboxing: false,
  } as SecurityScanConfig,
};
