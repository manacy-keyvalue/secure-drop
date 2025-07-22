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
    <div className="min-h-screen bg-background relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SecureDrop</span>
            </div>

            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/demo")}
              >
                Demo
              </Button>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/auth")}
              >
                Dashboard
              </Button>
              <Button
                size="sm"
                className="gradient-primary"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* 3D Logo Effect */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary animate-pulse-glow">
                <Shield className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"></div>
              <div
                className="absolute -inset-4 rounded-full border border-primary/20 animate-ping"
                style={{ animationDelay: "0.5s" }}
              ></div>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-primary to-accent bg-clip-text text-transparent">
              Secure Every Upload.
            </span>
            <br />
            <span className="bg-gradient-to-r from-accent via-white to-primary bg-clip-text text-transparent">
              Protect Every File.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            Enterprise-grade secure file upload platform with AI-powered threat
            detection, real-time scanning, and compliance-ready features for
            modern applications.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Badge className="bg-success/10 text-success border-success/30 px-6 py-3 text-base font-medium backdrop-blur-sm">
              <Globe className="w-4 h-4 mr-2" />
              React 19 Compatible
            </Badge>
            <Badge className="bg-primary/10 text-primary border-primary/30 px-6 py-3 text-base font-medium backdrop-blur-sm">
              <Lock className="w-4 h-4 mr-2" />
              Enterprise Security
            </Badge>
            <Badge className="bg-accent/10 text-accent border-accent/30 px-6 py-3 text-base font-medium backdrop-blur-sm">
              <Zap className="w-4 h-4 mr-2" />
              High Performance
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="gradient-primary glow-primary px-8 py-4 text-lg font-semibold hover:scale-105 transition-all duration-200 min-w-[200px]"
              onClick={() => navigate("/demo")}
            >
              <Target className="w-6 h-6 mr-3" />
              Get a Demo
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-primary/30 hover:bg-primary/10 hover:scale-105 transition-all duration-200 backdrop-blur-sm min-w-[200px]"
              onClick={() => navigate("/auth")}
            >
              <Settings className="w-6 h-6 mr-3" />
              Access Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 border-t border-border/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-xl text-muted-foreground">
              Built for modern applications that demand the highest security
              standards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="security-glass hover:scale-105 hover:shadow-2xl transition-all duration-300 border-primary/10 hover:border-primary/30 relative group overflow-hidden p-6"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-${
                      feature.color.split("-")[1]
                    }/20 to-${
                      feature.color.split("-")[1]
                    }/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="py-24 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Comprehensive Protection
            </h2>
            <p className="text-xl text-muted-foreground">
              Advanced security features that keep your files safe
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-primary/5 transition-colors duration-200"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-success to-success-glow flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg leading-relaxed">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:scale-105 transition-transform duration-200">
              <div className="text-5xl font-bold text-primary mb-3">99.9%</div>
              <div className="text-muted-foreground font-medium">
                Threat Detection Rate
              </div>
            </div>
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 hover:scale-105 transition-transform duration-200">
              <div className="text-5xl font-bold text-success mb-3">
                &lt;250ms
              </div>
              <div className="text-muted-foreground font-medium">
                Average Scan Time
              </div>
            </div>
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 hover:scale-105 transition-transform duration-200">
              <div className="text-5xl font-bold text-accent mb-3">100%</div>
              <div className="text-muted-foreground font-medium">
                GDPR Compliant
              </div>
            </div>
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 hover:scale-105 transition-transform duration-200">
              <div className="text-5xl font-bold text-warning mb-3">24/7</div>
              <div className="text-muted-foreground font-medium">
                Security Monitoring
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-16 border-t border-border/30">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SecureDrop v1.0</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Built with React 19, TypeScript, and modern security practices
          </p>
          <p className="text-sm text-muted-foreground/70">
            Making file uploads secure by default
          </p>
        </div>
      </footer>
    </div>
  );
}
