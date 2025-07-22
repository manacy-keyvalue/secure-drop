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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl opacity-20 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center glow-primary animate-pulse-glow">
                <Shield className="w-12 h-12 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-primary/30 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="text-left">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent leading-tight">
                SecureDrop
              </h1>
              <p className="text-xl text-muted-foreground mt-2 font-medium">
                Enterprise-Grade Secure File Upload Platform
              </p>
            </div>
          </div>

          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed">
            A pluggable, security-first file upload toolkit that combines deep
            security scanning, compliance features, and developer-friendly APIs
            into a single, powerful platform.
          </p>

          <div className="flex items-center justify-center gap-6 mb-12 flex-wrap">
            <Badge
              className="bg-success/10 text-success border-success/30 px-4 py-2 text-sm font-medium backdrop-blur-sm"
              variant="outline"
            >
              <Globe className="w-4 h-4 mr-2" />
              React 19 Compatible
            </Badge>
            <Badge
              className="bg-primary/10 text-primary border-primary/30 px-4 py-2 text-sm font-medium backdrop-blur-sm"
              variant="outline"
            >
              <Lock className="w-4 h-4 mr-2" />
              Enterprise Security
            </Badge>
            <Badge
              className="bg-accent/10 text-accent border-accent/30 px-4 py-2 text-sm font-medium backdrop-blur-sm"
              variant="outline"
            >
              <Zap className="w-4 h-4 mr-2" />
              High Performance
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="gradient-primary glow-primary flex items-center gap-3 px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform duration-200"
              onClick={() => navigate("/demo")}
            >
              <Target className="w-6 h-6" />
              Try Live Demo
              <ArrowRight className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex items-center gap-3 px-8 py-4 text-lg border-primary/30 hover:bg-primary/10 hover:scale-105 transition-all duration-200 backdrop-blur-sm"
              onClick={() => navigate("/auth")}
            >
              <Settings className="w-6 h-6" />
              Access Dashboard
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="security-glass hover:scale-105 hover:shadow-2xl transition-all duration-300 border-primary/10 hover:border-primary/30 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="text-center relative z-10 pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-${feature.color.split('-')[1]}/20 to-${feature.color.split('-')[1]}/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon
                    className={`w-8 h-8 ${feature.color}`}
                  />
                </div>
                <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-center text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Benefits */}
        <Card className="security-glass mb-20 border-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <CardHeader className="text-center relative z-10 pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Key Security Features
            </CardTitle>
            <CardDescription className="text-lg mt-3">
              Comprehensive protection against modern threats
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-primary/5 transition-colors duration-200">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-success to-success-glow flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo Preview Cards */}
        <div className="grid md:grid-cols-2 gap-10 mb-20">
          <Card
            className="security-glass cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 border-primary/10 hover:border-primary/30 relative group overflow-hidden"
            onClick={() => navigate("/demo")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Interactive Demo
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Experience SecureDrop's features with our comprehensive demo
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary-glow rounded-full"></div>
                  <span>Test different security profiles (Basic, Moderate, Strict)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-gradient-to-r from-success to-success-glow rounded-full"></div>
                  <span>Simulate threat detection and security scanning</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-gradient-to-r from-accent to-accent rounded-full"></div>
                  <span>View real-time analytics and system health</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-gradient-to-r from-warning to-warning rounded-full"></div>
                  <span>Explore integration examples and CLI tools</span>
                </div>
              </div>
              <Button className="w-full mt-6 gradient-primary text-white hover:scale-105 transition-transform duration-200" variant="default">
                Launch Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card
            className="security-glass cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 border-accent/10 hover:border-accent/30 relative group overflow-hidden"
            onClick={() => navigate("/auth")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                Admin Dashboard
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Configure and manage your SecureDrop instance
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary-glow rounded-full"></div>
                  <span>Create and manage security configuration profiles</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-gradient-to-r from-success to-success-glow rounded-full"></div>
                  <span>Monitor upload statistics and threat intelligence</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-gradient-to-r from-accent to-accent rounded-full"></div>
                  <span>View comprehensive audit logs and compliance data</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-gradient-to-r from-warning to-warning rounded-full"></div>
                  <span>Configure webhooks and real-time alerts</span>
                </div>
              </div>
              <Button className="w-full mt-6 border-accent/30 hover:bg-accent/10 hover:scale-105 transition-all duration-200" variant="outline">
                Access Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:scale-105 transition-transform duration-200">
            <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground font-medium">
              Threat Detection Rate
            </div>
          </div>
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 hover:scale-105 transition-transform duration-200">
            <div className="text-4xl font-bold text-success mb-2">&lt;250ms</div>
            <div className="text-sm text-muted-foreground font-medium">
              Average Scan Time
            </div>
          </div>
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 hover:scale-105 transition-transform duration-200">
            <div className="text-4xl font-bold text-accent mb-2">100%</div>
            <div className="text-sm text-muted-foreground font-medium">GDPR Compliant</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 hover:scale-105 transition-transform duration-200">
            <div className="text-4xl font-bold text-warning mb-2">24/7</div>
            <div className="text-sm text-muted-foreground font-medium">
              Security Monitoring
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-12 border-t border-border/30 mt-8">
          <div className="max-w-2xl mx-auto">
            <p className="text-base text-muted-foreground mb-6 leading-relaxed">
              Built with React 19, TypeScript, and modern security practices
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-medium">SecureDrop v1.0</span>
              <span className="text-muted-foreground/70">-</span>
              <span>Making file uploads secure by default</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
