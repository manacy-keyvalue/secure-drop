/**
 * SecureDrop Landing Page
 * Welcome page with navigation to demo and dashboard
 */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Target,
  Settings,
  Zap,
  Lock,
  Globe,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Advanced Security",
      description:
        "Multi-layer threat detection with virus scanning and injection protection",
      color: "text-primary",
    },
    {
      icon: Settings,
      title: "Admin Dashboard",
      description: "Comprehensive configuration and management interface",
      color: "text-accent",
    },
    {
      icon: Zap,
      title: "High Performance",
      description: "Fast file processing with real-time security scanning",
      color: "text-warning",
    },
    {
      icon: Lock,
      title: "Compliance Ready",
      description: "GDPR, HIPAA, and SOC2 compliant with full audit trails",
      color: "text-success",
    },
  ];

  const benefits = [
    "Magic byte validation and MIME spoofing detection",
    "Injection pattern scanning (SQL, XSS, Code injection)",
    "YARA rule integration for custom malware detection",
    "Configurable security profiles and upload constraints",
    "Real-time analytics and threat intelligence",
    "Device fingerprinting and behavioral analysis",
    "Watermarked previews and secure file streaming",
    "CLI tools for testing and development",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center glow-primary">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SecureDrop
              </h1>
              <p className="text-xl text-muted-foreground">
                Enterprise-Grade Secure File Upload Platform
              </p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            A pluggable, security-first file upload toolkit that combines deep
            security scanning, compliance features, and developer-friendly APIs
            into a single, powerful platform.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge
              className="bg-success/20 text-success border-success/40"
              variant="outline"
            >
              <Globe className="w-3 h-3 mr-1" />
              React 19 Compatible
            </Badge>
            <Badge
              className="bg-primary/20 text-primary border-primary/40"
              variant="outline"
            >
              <Lock className="w-3 h-3 mr-1" />
              Enterprise Security
            </Badge>
            <Badge
              className="bg-accent/20 text-accent border-accent/40"
              variant="outline"
            >
              <Zap className="w-3 h-3 mr-1" />
              High Performance
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="gradient-primary glow-primary flex items-center gap-2"
              onClick={() => navigate("/demo")}
            >
              <Target className="w-5 h-5" />
              Try Live Demo
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
              onClick={() => navigate("/auth")}
            >
              <Settings className="w-5 h-5" />
              Access Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="security-glass hover:scale-105 transition-transform"
            >
              <CardHeader className="text-center">
                <feature.icon
                  className={`w-8 h-8 mx-auto mb-2 ${feature.color}`}
                />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Benefits */}
        <Card className="security-glass mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Key Security Features</CardTitle>
            <CardDescription>
              Comprehensive protection against modern threats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo Preview Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card
            className="security-glass cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate("/demo")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Interactive Demo
              </CardTitle>
              <CardDescription>
                Experience SecureDrop's features with our comprehensive demo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Test different security profiles (Basic, Moderate, Strict)
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  Simulate threat detection and security scanning
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  View real-time analytics and system health
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  Explore integration examples and CLI tools
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Launch Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card
            className="security-glass cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate("/auth")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Admin Dashboard
              </CardTitle>
              <CardDescription>
                Configure and manage your SecureDrop instance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Create and manage security configuration profiles
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Monitor upload statistics and threat intelligence
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  View comprehensive audit logs and compliance data
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  Configure webhooks and real-time alerts
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Access Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">99.9%</div>
            <div className="text-sm text-muted-foreground">
              Threat Detection Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success">&lt;250ms</div>
            <div className="text-sm text-muted-foreground">
              Average Scan Time
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">100%</div>
            <div className="text-sm text-muted-foreground">GDPR Compliant</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning">24/7</div>
            <div className="text-sm text-muted-foreground">
              Security Monitoring
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-4">
            Built with React 19, TypeScript, and modern security practices
          </p>
          <p className="text-xs text-muted-foreground">
            SecureDrop v1.0 - Making file uploads secure by default 🛡️
          </p>
        </div>
      </div>
    </div>
  );
}
