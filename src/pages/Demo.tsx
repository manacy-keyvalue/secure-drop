/**
 * SecureDrop Demo Page
 * Comprehensive showcase of all SecureDrop features and capabilities
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import SecureDropWrapper from "@/components/SecureDropWrapper";
import { EnhancedUploadConfigDashboard } from "@/components/admin/EnhancedUploadConfigDashboard";
import {
  Shield,
  Zap,
  Target,
  Settings,
  BarChart3,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Globe,
  Lock,
  Cpu,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Demo() {
  const [demoStats, setDemoStats] = useState({
    totalUploads: 142,
    threatsBlocked: 7,
    avgScanTime: 245,
    securityScore: 94,
  });

  const [selectedProfile, setSelectedProfile] = useState("moderate");
  const { toast } = useToast();

  const securityProfiles = {
    basic: {
      name: "Basic Security",
      description: "Standard file validation with basic threat detection",
      features: [
        "MIME validation",
        "File size limits",
        "Basic extension filtering",
      ],
      color: "bg-success/20 text-success-foreground border-success/40",
      maxSize: 10 * 1024 * 1024,
      allowedTypes: ["image/*", "application/pdf", "text/*"],
    },
    moderate: {
      name: "Moderate Security",
      description:
        "Enhanced protection with injection detection and virus scanning",
      features: [
        "All Basic features",
        "Injection detection",
        "Virus scanning",
        "Magic byte validation",
      ],
      color: "bg-primary/20 text-primary-foreground border-primary/40",
      maxSize: 10 * 1024 * 1024,
      allowedTypes: ["image/*", "application/pdf", "text/*"],
    },
    strict: {
      name: "Strict Security",
      description: "Maximum protection with YARA rules and behavioral analysis",
      features: [
        "All Moderate features",
        "YARA rule scanning",
        "Behavioral analysis",
        "Advanced heuristics",
      ],
      color:
        "bg-destructive/20 text-destructive-foreground border-destructive/40",
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ["image/png", "image/jpeg", "application/pdf"],
    },
  };

  const handleProfileChange = (profile: string) => {
    setSelectedProfile(profile);
    toast({
      title: "Security Profile Changed",
      description: `Switched to ${
        securityProfiles[profile as keyof typeof securityProfiles].name
      }`,
    });
  };

  const handleDemoUpload = (files: Record<string, unknown>[]) => {
    // Update demo stats
    setDemoStats((prev) => ({
      ...prev,
      totalUploads: prev.totalUploads + files.length,
      avgScanTime: Math.floor(Math.random() * 500) + 100,
    }));

    toast({
      title: "Demo Upload Complete",
      description: `Successfully processed ${files.length} file(s) with ${selectedProfile} security`,
    });
  };

  const simulateThreatDetection = () => {
    setDemoStats((prev) => ({
      ...prev,
      threatsBlocked: prev.threatsBlocked + 1,
      securityScore: Math.max(90, prev.securityScore - 1),
    }));

    toast({
      title: "Security Threat Detected!",
      description: "Malicious file blocked by security scanner",
      variant: "destructive",
    });
  };

  const simulateSecurityScan = () => {
    toast({
      title: "Security Scan Running",
      description: "Scanning files with advanced threat detection...",
    });

    setTimeout(() => {
      toast({
        title: "Scan Complete",
        description: "All files passed security screening",
      });
    }, 2000);
  };

  const currentProfile =
    securityProfiles[selectedProfile as keyof typeof securityProfiles];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center glow-primary">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SecureDrop Demo
              </h1>
              <p className="text-xl text-muted-foreground">
                Enterprise-Grade Secure File Upload Platform
              </p>
            </div>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="security-glass">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {demoStats.totalUploads}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Uploads
                </div>
              </CardContent>
            </Card>
            <Card className="security-glass">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-destructive">
                  {demoStats.threatsBlocked}
                </div>
                <div className="text-sm text-muted-foreground">
                  Threats Blocked
                </div>
              </CardContent>
            </Card>
            <Card className="security-glass">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">
                  {demoStats.avgScanTime}ms
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg Scan Time
                </div>
              </CardContent>
            </Card>
            <Card className="security-glass">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">
                  {demoStats.securityScore}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Security Score
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Demo Tabs */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Upload Demo
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Features
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Admin Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="integration"
              className="flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              Integration
            </TabsTrigger>
          </TabsList>

          {/* Upload Demo Tab */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="security-glass">
                <CardHeader>
                  <CardTitle>Security Profile Selector</CardTitle>
                  <CardDescription>
                    Choose your security configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(securityProfiles).map(([key, profile]) => (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedProfile === key
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => handleProfileChange(key)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={profile.color} variant="outline">
                          {profile.name}
                        </Badge>
                        {selectedProfile === key && (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {profile.description}
                      </p>
                      <div className="space-y-1">
                        {profile.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs"
                          >
                            <div className="w-1 h-1 bg-current rounded-full opacity-50" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="md:col-span-2">
                <Card className="security-glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Secure Upload Zone - {currentProfile.name}
                    </CardTitle>
                    <CardDescription>
                      Upload files with {currentProfile.name.toLowerCase()}{" "}
                      protection level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SecureDropWrapper
                      maxFiles={5}
                      maxFileSize={currentProfile.maxSize}
                      allowedTypes={currentProfile.allowedTypes}
                      securityLevel={
                        selectedProfile as "basic" | "moderate" | "strict"
                      }
                      onUploadComplete={handleDemoUpload}
                      showProgress={true}
                      showPreview={true}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Security Features Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="security-glass">
                <CardHeader>
                  <CardTitle>Threat Detection Demo</CardTitle>
                  <CardDescription>
                    Simulate various security scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      onClick={simulateThreatDetection}
                      variant="destructive"
                      className="w-full flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Simulate Threat Detection
                    </Button>

                    <Button
                      onClick={simulateSecurityScan}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      Run Security Scan
                    </Button>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Security Features Active:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>✓ Magic byte validation</li>
                        <li>✓ MIME spoofing detection</li>
                        <li>✓ Injection pattern scanning</li>
                        <li>✓ Virus scanning simulation</li>
                        <li>✓ YARA rule matching</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card className="security-glass">
                <CardHeader>
                  <CardTitle>Real-time Security Monitoring</CardTitle>
                  <CardDescription>Live security event stream</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      {
                        type: "success",
                        message: "File scan completed - Clean",
                        time: "2 seconds ago",
                      },
                      {
                        type: "warning",
                        message: "Suspicious pattern detected",
                        time: "1 minute ago",
                      },
                      {
                        type: "error",
                        message: "Malicious file blocked",
                        time: "3 minutes ago",
                      },
                      {
                        type: "info",
                        message: "Security profile updated",
                        time: "5 minutes ago",
                      },
                    ].map((event, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            event.type === "success"
                              ? "bg-green-500"
                              : event.type === "warning"
                              ? "bg-yellow-500"
                              : event.type === "error"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Admin Dashboard Tab */}
          <TabsContent value="admin" className="space-y-6">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>Admin Dashboard:</strong> Configure upload constraints,
                security profiles, and monitor system activity. This is where
                administrators can create custom security policies and manage
                the entire SecureDrop platform.
              </AlertDescription>
            </Alert>

            <EnhancedUploadConfigDashboard />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="security-glass">
                <CardHeader>
                  <CardTitle>Upload Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Success Rate</span>
                      <span className="text-sm font-medium">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Threat Detection</span>
                      <span className="text-sm font-medium">99.2%</span>
                    </div>
                    <Progress value={99.2} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Performance</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="security-glass">
                <CardHeader>
                  <CardTitle>Threat Intelligence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { threat: "Script Injection", count: 12, severity: "High" },
                    {
                      threat: "Malware Signature",
                      count: 7,
                      severity: "Critical",
                    },
                    { threat: "MIME Spoofing", count: 23, severity: "Medium" },
                    { threat: "Suspicious Pattern", count: 5, severity: "Low" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.threat}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.count} detections
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.severity === "Critical"
                            ? "destructive"
                            : item.severity === "High"
                            ? "destructive"
                            : item.severity === "Medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {item.severity}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="security-glass">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        99.9%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Uptime
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        245ms
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Avg Response
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        1.2GB
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Data Processed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        127
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Active Sessions
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="security-glass">
                <CardHeader>
                  <CardTitle>React Integration</CardTitle>
                  <CardDescription>
                    Drop-in component for React applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                    <pre>{`import { SecureDropWrapper } from 'securedrop';

function App() {
  return (
    <SecureDropWrapper
      maxFiles={10}
      securityLevel="strict"
      onUploadComplete={(files) => {
        // Files uploaded successfully
      }}
      onThreatDetected={(file, threats) => {
        console.warn('Threat:', threats);
      }}
    />
  );
}`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card className="security-glass">
                <CardHeader>
                  <CardTitle>Backend Integration</CardTitle>
                  <CardDescription>
                    Node.js/Express server integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                    <pre>{`const { SecureDropAPI } = require('securedrop');

const api = new SecureDropAPI({
  afterScan: async (file, result) => {
    if (!result.isClean) {
      await sendAlert(result.threats);
    }
  }
});

app.post('/upload', async (req, res) => {
  const result = await api.uploadFile(req.file);
  res.json(result);
});`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card className="security-glass md:col-span-2">
                <CardHeader>
                  <CardTitle>CLI Tools</CardTitle>
                  <CardDescription>
                    Command-line utilities for development and testing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono">
                    <div className="space-y-2">
                      <div>
                        <span className="text-green-400">$</span> securedrop-cli
                        generate-mock --type malicious --count 10
                      </div>
                      <div>
                        <span className="text-green-400">$</span> securedrop-cli
                        scan ./uploads --level strict
                      </div>
                      <div>
                        <span className="text-green-400">$</span> securedrop-cli
                        benchmark --files 1000 --size 5
                      </div>
                      <div>
                        <span className="text-green-400">$</span> securedrop-cli
                        generate-examples --framework react
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 p-6 border-t">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>React 19 Compatible</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>High Performance</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            SecureDrop v1.0 - Making file uploads secure by default
          </p>
        </div>
      </div>
    </div>
  );
}
