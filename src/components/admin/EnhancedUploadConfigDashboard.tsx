/**
 * Enhanced Upload Configuration Dashboard with Profiles
 * Advanced admin controls for managing multiple upload constraint profiles
 */

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Plus,
  Trash2,
  BarChart3,
  Shield,
  Copy,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SECURITY_CONFIGS } from "@/lib/security-scanner";

interface EnhancedUploadConfig {
  id: string;
  config_name: string;
  description: string;
  max_file_size: number;
  allowed_mime_types: string[];
  blocked_extensions: string[];
  filename_pattern: string;
  default_expiry_hours: number;
  require_watermark: boolean;
  auto_scan: boolean;
  max_files_per_user: number;
  security_level: "basic" | "moderate" | "strict";
  virus_scanning_enabled: boolean;
  injection_detection_enabled: boolean;
  yara_scanning_enabled: boolean;
  custom_signatures: string[];
  webhook_url?: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface SecurityStats {
  totalUploads: number;
  totalSize: number;
  successRate: number;
  threatCount: number;
  topThreats: Array<{ name: string; count: number; severity: string }>;
  recentActivities: any[];
  fingerprintStats: Array<{
    fingerprint: string;
    count: number;
    lastSeen: string;
  }>;
}

export function EnhancedUploadConfigDashboard() {
  const [configs, setConfigs] = useState<EnhancedUploadConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<EnhancedUploadConfig | null>(
    null
  );
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingPattern, setTestingPattern] = useState("");
  const [patternTestResult, setPatternTestResult] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
    loadSecurityStats();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("upload_configs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const enhancedConfigs = (data || []).map((config) => ({
        ...config,
        description: config.description || "Default configuration",
        blocked_extensions: config.blocked_extensions || [],
        filename_pattern: config.filename_pattern || "",
        security_level: config.security_level || "moderate",
        virus_scanning_enabled: config.virus_scanning_enabled ?? true,
        injection_detection_enabled: config.injection_detection_enabled ?? true,
        yara_scanning_enabled: config.yara_scanning_enabled ?? false,
        custom_signatures: config.custom_signatures || [],
        webhook_url: config.webhook_url || "",
        is_active: config.is_active ?? true,
        usage_count: config.usage_count || 0,
      })) as EnhancedUploadConfig[];

      setConfigs(enhancedConfigs);
      if (enhancedConfigs.length > 0) {
        setActiveConfig(enhancedConfigs[0]);
      }
    } catch (error: any) {
      toast({
        title: "Error loading configs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityStats = async () => {
    try {
      // Get comprehensive security statistics
      const { data: uploads, error: uploadsError } = await supabase
        .from("file_uploads")
        .select("id, file_size, status, scan_result, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (uploadsError) throw uploadsError;

      const { data: auditLogs, error: auditError } = await supabase
        .from("audit_logs")
        .select("action, details, created_at")
        .eq("action", "security_threat_detected")
        .order("created_at", { ascending: false })
        .limit(100);

      if (auditError) throw auditError;

      const totalUploads = uploads?.length || 0;
      const totalSize =
        uploads?.reduce((sum, upload) => sum + (upload.file_size || 0), 0) || 0;
      const successCount =
        uploads?.filter(
          (upload) =>
            upload.status === "approved" || upload.status === "scanning"
        ).length || 0;
      const successRate =
        totalUploads > 0 ? (successCount / totalUploads) * 100 : 0;

      // Count threats from scan results
      const threatCount =
        uploads?.filter(
          (upload) => upload.scan_result && !upload.scan_result.isClean
        ).length || 0;

      // Aggregate top threats
      const threatMap = new Map<string, { count: number; severity: string }>();
      uploads?.forEach((upload) => {
        if (upload.scan_result && upload.scan_result.threats) {
          upload.scan_result.threats.forEach((threat: any) => {
            const existing = threatMap.get(threat.name) || {
              count: 0,
              severity: threat.severity,
            };
            threatMap.set(threat.name, {
              count: existing.count + 1,
              severity: threat.severity,
            });
          });
        }
      });

      const topThreats = Array.from(threatMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setStats({
        totalUploads,
        totalSize,
        successRate,
        threatCount,
        topThreats,
        recentActivities: auditLogs?.slice(0, 20) || [],
        fingerprintStats: [], // TODO: Implement fingerprint tracking
      });
    } catch (error: any) {
      console.error("Error loading security stats:", error);
    }
  };

  const saveConfig = async () => {
    if (!activeConfig) return;

    setSaving(true);
    try {
      const configData = {
        id: activeConfig.id || undefined,
        config_name: activeConfig.config_name,
        description: activeConfig.description,
        max_file_size: activeConfig.max_file_size,
        allowed_mime_types: activeConfig.allowed_mime_types,
        blocked_extensions: activeConfig.blocked_extensions,
        filename_pattern: activeConfig.filename_pattern,
        default_expiry_hours: activeConfig.default_expiry_hours,
        require_watermark: activeConfig.require_watermark,
        auto_scan: activeConfig.auto_scan,
        max_files_per_user: activeConfig.max_files_per_user,
        security_level: activeConfig.security_level,
        virus_scanning_enabled: activeConfig.virus_scanning_enabled,
        injection_detection_enabled: activeConfig.injection_detection_enabled,
        yara_scanning_enabled: activeConfig.yara_scanning_enabled,
        custom_signatures: activeConfig.custom_signatures,
        webhook_url: activeConfig.webhook_url,
        is_active: activeConfig.is_active,
      };

      const { error } = await supabase
        .from("upload_configs")
        .upsert(configData);

      if (error) throw error;

      toast({
        title: "Configuration saved",
        description:
          "Upload configuration profile has been updated successfully.",
      });

      await loadConfigs();
    } catch (error: any) {
      toast({
        title: "Error saving config",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const createNewConfig = () => {
    const newConfig: EnhancedUploadConfig = {
      id: "",
      config_name: "New Configuration Profile",
      description: "Custom upload configuration",
      max_file_size: 10 * 1024 * 1024,
      allowed_mime_types: ["image/*", "application/pdf", "text/*"],
      blocked_extensions: ["exe", "bat", "cmd", "scr"],
      filename_pattern: "^[a-zA-Z0-9._-]+$",
      default_expiry_hours: 72,
      require_watermark: false,
      auto_scan: true,
      max_files_per_user: 100,
      security_level: "moderate",
      virus_scanning_enabled: true,
      injection_detection_enabled: true,
      yara_scanning_enabled: false,
      custom_signatures: [],
      webhook_url: "",
      is_active: true,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setActiveConfig(newConfig);
  };

  const duplicateConfig = (config: EnhancedUploadConfig) => {
    const duplicated = {
      ...config,
      id: "",
      config_name: `${config.config_name} (Copy)`,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setActiveConfig(duplicated);
  };

  const deleteConfig = async (configId: string) => {
    if (!confirm("Are you sure you want to delete this configuration profile?"))
      return;

    try {
      const { error } = await supabase
        .from("upload_configs")
        .delete()
        .eq("id", configId);

      if (error) throw error;

      toast({
        title: "Configuration deleted",
        description: "Upload configuration profile has been removed.",
      });

      await loadConfigs();
    } catch (error: any) {
      toast({
        title: "Error deleting config",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const testFilenamePattern = () => {
    if (!activeConfig?.filename_pattern || !testingPattern) {
      setPatternTestResult("Please enter both a pattern and test filename");
      return;
    }

    try {
      const regex = new RegExp(activeConfig.filename_pattern);
      const matches = regex.test(testingPattern);
      setPatternTestResult(
        matches
          ? `✅ "${testingPattern}" matches the pattern`
          : `❌ "${testingPattern}" does not match the pattern`
      );
    } catch (error: any) {
      setPatternTestResult(`❌ Invalid regex pattern: ${error.message}`);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const addMimeType = (mimeType: string) => {
    if (!activeConfig || !mimeType.trim()) return;

    const newTypes = [...activeConfig.allowed_mime_types, mimeType.trim()];
    setActiveConfig({
      ...activeConfig,
      allowed_mime_types: newTypes,
    });
  };

  const removeMimeType = (index: number) => {
    if (!activeConfig) return;

    const newTypes = activeConfig.allowed_mime_types.filter(
      (_, i) => i !== index
    );
    setActiveConfig({
      ...activeConfig,
      allowed_mime_types: newTypes,
    });
  };

  const addBlockedExtension = (extension: string) => {
    if (!activeConfig || !extension.trim()) return;

    const cleanExt = extension.trim().toLowerCase().replace(".", "");
    const newExtensions = [...activeConfig.blocked_extensions, cleanExt];
    setActiveConfig({
      ...activeConfig,
      blocked_extensions: newExtensions,
    });
  };

  const removeBlockedExtension = (index: number) => {
    if (!activeConfig) return;

    const newExtensions = activeConfig.blocked_extensions.filter(
      (_, i) => i !== index
    );
    setActiveConfig({
      ...activeConfig,
      blocked_extensions: newExtensions,
    });
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case "basic":
        return "bg-warning/20 text-warning border-warning/40";
      case "moderate":
        return "bg-primary/20 text-primary border-primary/40";
      case "strict":
        return "bg-destructive/20 text-destructive border-destructive/40";
      default:
        return "bg-muted/40 text-muted-foreground border-muted";
    }
  };

  const getThreatSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "text-success";
      case "medium":
        return "text-warning";
      case "high":
        return "text-warning";
      case "critical":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading enhanced dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Enhanced Security Configuration & Analytics
          </h2>
          <p className="text-muted-foreground">
            Manage advanced upload profiles with comprehensive security controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNewConfig} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Profile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profiles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profiles">Configuration Profiles</TabsTrigger>
          <TabsTrigger value="security">Security Analytics</TabsTrigger>
          <TabsTrigger value="threats">Threat Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Profile List */}
            <Card>
              <CardHeader>
                <CardTitle>Profiles ({configs.length})</CardTitle>
                <CardDescription>
                  Select a configuration profile to edit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {configs.map((config) => (
                    <div
                      key={config.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        activeConfig?.id === config.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => setActiveConfig(config)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {config.config_name}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateConfig(config);
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConfig(config.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {config.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getSecurityLevelColor(
                              config.security_level
                            )}
                            variant="secondary"
                          >
                            {config.security_level}
                          </Badge>
                          <Badge
                            variant={config.is_active ? "default" : "secondary"}
                          >
                            {config.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Used {config.usage_count} times • Max:{" "}
                          {formatBytes(config.max_file_size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configuration Editor */}
            <div className="md:col-span-3">
              {activeConfig && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Edit Configuration Profile
                    </CardTitle>
                    <CardDescription>
                      Modify advanced upload rules and security constraints
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="config-name">Profile Name</Label>
                        <Input
                          id="config-name"
                          value={activeConfig.config_name}
                          onChange={(e) =>
                            setActiveConfig({
                              ...activeConfig,
                              config_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="security-level">Security Level</Label>
                        <Select
                          value={activeConfig.security_level}
                          onValueChange={(
                            value: "basic" | "moderate" | "strict"
                          ) =>
                            setActiveConfig({
                              ...activeConfig,
                              security_level: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">
                              Basic - Standard validation
                            </SelectItem>
                            <SelectItem value="moderate">
                              Moderate - Enhanced security
                            </SelectItem>
                            <SelectItem value="strict">
                              Strict - Maximum protection
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={activeConfig.description}
                        onChange={(e) =>
                          setActiveConfig({
                            ...activeConfig,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe the purpose and use case for this configuration profile"
                      />
                    </div>

                    {/* File Constraints */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="max-file-size">
                          Max File Size (MB)
                        </Label>
                        <Input
                          id="max-file-size"
                          type="number"
                          value={activeConfig.max_file_size / 1024 / 1024}
                          onChange={(e) =>
                            setActiveConfig({
                              ...activeConfig,
                              max_file_size:
                                parseFloat(e.target.value) * 1024 * 1024,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiry-hours">Expiry Hours</Label>
                        <Input
                          id="expiry-hours"
                          type="number"
                          value={activeConfig.default_expiry_hours}
                          onChange={(e) =>
                            setActiveConfig({
                              ...activeConfig,
                              default_expiry_hours: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-files">Max Files Per User</Label>
                        <Input
                          id="max-files"
                          type="number"
                          value={activeConfig.max_files_per_user}
                          onChange={(e) =>
                            setActiveConfig({
                              ...activeConfig,
                              max_files_per_user: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* MIME Types */}
                    <div>
                      <Label>Allowed MIME Types</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {activeConfig.allowed_mime_types.map((type, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeMimeType(index)}
                          >
                            {type} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Add MIME type (e.g., image/*, application/pdf)"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              addMimeType(e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            const input = e.currentTarget
                              .previousElementSibling as HTMLInputElement;
                            addMimeType(input.value);
                            input.value = "";
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Blocked Extensions */}
                    <div>
                      <Label>Blocked File Extensions</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {activeConfig.blocked_extensions.map((ext, index) => (
                          <Badge
                            key={index}
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => removeBlockedExtension(index)}
                          >
                            .{ext} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Add blocked extension (e.g., exe, bat, scr)"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              addBlockedExtension(e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            const input = e.currentTarget
                              .previousElementSibling as HTMLInputElement;
                            addBlockedExtension(input.value);
                            input.value = "";
                          }}
                        >
                          Block
                        </Button>
                      </div>
                    </div>

                    {/* Filename Pattern */}
                    <div>
                      <Label htmlFor="filename-pattern">
                        Filename Pattern (Regex)
                      </Label>
                      <div className="space-y-2">
                        <Input
                          id="filename-pattern"
                          value={activeConfig.filename_pattern}
                          onChange={(e) =>
                            setActiveConfig({
                              ...activeConfig,
                              filename_pattern: e.target.value,
                            })
                          }
                          placeholder="^[a-zA-Z0-9._-]+$"
                        />
                        <div className="flex gap-2">
                          <Input
                            placeholder="Test filename..."
                            value={testingPattern}
                            onChange={(e) => setTestingPattern(e.target.value)}
                          />
                          <Button
                            variant="outline"
                            onClick={testFilenamePattern}
                          >
                            Test
                          </Button>
                        </div>
                        {patternTestResult && (
                          <Alert>
                            <AlertDescription>
                              {patternTestResult}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>

                    {/* Security Features */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Security Features</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="virus-scanning">Virus Scanning</Label>
                          <Switch
                            id="virus-scanning"
                            checked={activeConfig.virus_scanning_enabled}
                            onCheckedChange={(checked) =>
                              setActiveConfig({
                                ...activeConfig,
                                virus_scanning_enabled: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="injection-detection">
                            Injection Detection
                          </Label>
                          <Switch
                            id="injection-detection"
                            checked={activeConfig.injection_detection_enabled}
                            onCheckedChange={(checked) =>
                              setActiveConfig({
                                ...activeConfig,
                                injection_detection_enabled: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="yara-scanning">YARA Rules</Label>
                          <Switch
                            id="yara-scanning"
                            checked={activeConfig.yara_scanning_enabled}
                            onCheckedChange={(checked) =>
                              setActiveConfig({
                                ...activeConfig,
                                yara_scanning_enabled: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="require-watermark">
                            Watermarking
                          </Label>
                          <Switch
                            id="require-watermark"
                            checked={activeConfig.require_watermark}
                            onCheckedChange={(checked) =>
                              setActiveConfig({
                                ...activeConfig,
                                require_watermark: checked,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Webhook Configuration */}
                    <div>
                      <Label htmlFor="webhook-url">
                        Webhook URL (Optional)
                      </Label>
                      <Input
                        id="webhook-url"
                        value={activeConfig.webhook_url}
                        onChange={(e) =>
                          setActiveConfig({
                            ...activeConfig,
                            webhook_url: e.target.value,
                          })
                        }
                        placeholder="https://your-app.com/webhooks/securedrop"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Receive notifications for security events and upload
                        activities
                      </p>
                    </div>

                    {/* Profile Status */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is-active">Profile Active</Label>
                      <Switch
                        id="is-active"
                        checked={activeConfig.is_active}
                        onCheckedChange={(checked) =>
                          setActiveConfig({
                            ...activeConfig,
                            is_active: checked,
                          })
                        }
                      />
                    </div>

                    <Button
                      onClick={saveConfig}
                      disabled={saving}
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving
                        ? "Saving Profile..."
                        : "Save Configuration Profile"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Uploads
                    </CardTitle>
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalUploads}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(stats.totalSize)} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Success Rate
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.successRate.toFixed(1)}%
                    </div>
                    <Progress value={stats.successRate} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Threats Detected
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {stats.threatCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalUploads > 0
                        ? (
                            (stats.threatCount / stats.totalUploads) *
                            100
                          ).toFixed(1)
                        : 0}
                      % of uploads
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Security Score
                    </CardTitle>
                    <Shield className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(
                        Math.max(
                          0,
                          100 -
                            (stats.threatCount /
                              Math.max(stats.totalUploads, 1)) *
                              100
                        )
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Overall security rating
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Security Activities</CardTitle>
                  <CardDescription>
                    Latest security events and system activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.recentActivities.length > 0 ? (
                    <div className="space-y-2">
                      {stats.recentActivities.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {activity.action === "security_threat_detected" ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            <div>
                              <p className="font-medium">
                                {activity.action.replace(/_/g, " ")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(activity.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {activity.details && (
                            <Badge variant="outline">
                              {activity.details.filename || "System"}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No recent security activities
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Threat Intelligence Dashboard</CardTitle>
              <CardDescription>
                Analysis of detected threats and security patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && stats.topThreats.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-semibold">Top Detected Threats</h4>
                  <div className="space-y-2">
                    {stats.topThreats.map((threat, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{index + 1}</Badge>
                          <div>
                            <p className="font-medium">{threat.name}</p>
                            <p
                              className={`text-sm ${getThreatSeverityColor(
                                threat.severity
                              )}`}
                            >
                              {threat.severity.toUpperCase()} severity
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{threat.count}</p>
                          <p className="text-sm text-muted-foreground">
                            detections
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-green-600">
                    All Clear!
                  </h3>
                  <p className="text-muted-foreground">
                    No security threats have been detected recently.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
