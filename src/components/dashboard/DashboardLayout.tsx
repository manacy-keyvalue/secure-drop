import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Upload,
  Settings,
  FileText,
  LogOut,
  User,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string;
}

export function DashboardLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        navigate("/auth");
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .single();

      if (profile) {
        setUser({
          id: authUser.id,
          email: authUser.email!,
          role: profile.role,
          full_name: profile.full_name,
        });
      }
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-glow">
          <Shield className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  const navigation = [
    { name: "Upload", href: "/dashboard", icon: Upload },
    { name: "Demo", href: "/demo", icon: Shield },
    { name: "My Files", href: "/dashboard/files", icon: FileText },
    ...(user?.role === "admin"
      ? [
          { name: "Admin Panel", href: "/dashboard/admin", icon: Settings },
          { name: "Audit Logs", href: "/dashboard/logs", icon: Activity },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">SecureDrop</h1>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => navigate(item.href)}
                  className="flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>{user?.full_name || user?.email}</span>
                {user?.role === "admin" && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                    Admin
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-3 overflow-x-auto">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.href)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
