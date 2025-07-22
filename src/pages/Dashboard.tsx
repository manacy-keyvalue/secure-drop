import { EnhancedUploadConfigDashboard } from "@/components/admin/EnhancedUploadConfigDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Settings,
  BarChart3,
  AlertTriangle,
  Users,
  Database,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 rounded-full gradient-primary flex items-center justify-center glow-primary">
          <Shield className="w-10 h-10 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">SecureDrop Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Configure security profiles, monitor uploads, and manage system
            settings
          </p>
        </div>
      </div>

      {/* Admin Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="security-card">
          <CardHeader className="text-center">
            <Settings className="w-8 h-8 text-primary mx-auto" />
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Manage security profiles, file constraints, and upload policies
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="security-card">
          <CardHeader className="text-center">
            <BarChart3 className="w-8 h-8 text-success mx-auto" />
            <CardTitle className="text-lg">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              View upload statistics, threat intelligence, and system
              performance
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="security-card">
          <CardHeader className="text-center">
            <AlertTriangle className="w-8 h-8 text-warning mx-auto" />
            <CardTitle className="text-lg">Security Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Real-time threat detection, blocked uploads, and security alerts
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="security-card">
          <CardHeader className="text-center">
            <Database className="w-8 h-8 text-accent mx-auto" />
            <CardTitle className="text-lg">Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Complete compliance logging for GDPR, HIPAA, and SOC2 requirements
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Dashboard */}
      <EnhancedUploadConfigDashboard />
    </div>
  );
}
