"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Mail, 
  Lock, 
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ScrollReveal from "@/components/ux/ScrollReveal";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      // Simple demo login
      if (formData.email === "demo@pixelprint.com" && formData.password === "demo123") {
        toast.success("Login successful! Redirecting to dashboard...");
        // Save user info to localStorage
        localStorage.setItem('pixel-print-user', JSON.stringify({
          name: "Demo User",
          email: "demo@pixelprint.com"
        }));
        window.location.href = "/dashboard";
      } else {
        toast.error("Invalid email or password. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    toast.info("Google sign-in coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-px-fg mb-2">Welcome Back</h1>
          <p className="text-px-muted">Sign in to your Pixel Print account</p>
        </div>

        <ScrollReveal>
          <Card>
            <CardHeader className="bg-gradient-to-r from-px-cyan/10 to-px-magenta/10">
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-px-cyan" />
                <span>Sign In</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-px-fg">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-px-fg">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-zinc-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-zinc-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                    />
                    <Label htmlFor="rememberMe" className="text-sm text-px-muted">
                      Remember me
                    </Label>
                  </div>
                  
                  <Link href="/forgot-password" className="text-sm text-px-cyan hover:underline">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-px-muted">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-sm text-px-muted">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-px-cyan hover:underline font-medium">
                      Create one here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Demo Credentials */}
        <ScrollReveal>
          <Card className="mt-6 bg-gradient-to-r from-px-cyan/5 to-px-magenta/5 border-px-cyan/20">
            <CardContent className="p-4">
              <h3 className="font-semibold text-px-fg mb-2">Demo Credentials</h3>
              <p className="text-sm text-px-muted mb-2">
                Use these credentials to test the dashboard:
              </p>
              <div className="space-y-1 text-sm">
                <p><strong>Email:</strong> demo@pixelprint.com</p>
                <p><strong>Password:</strong> demo123</p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}
