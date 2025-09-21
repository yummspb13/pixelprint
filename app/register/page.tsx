"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, 
  Mail, 
  Lock, 
  Building, 
  Phone, 
  MapPin,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ScrollReveal from "@/components/ux/ScrollReveal";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);
    try {
      // Simple demo registration
      toast.success("Account created successfully! Redirecting to dashboard...");
      // Save user info to localStorage
      localStorage.setItem('pixel-print-user', JSON.stringify({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email
      }));
      setIsSuccess(true);
    } catch (error) {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    toast.info("Google sign-up coming soon!");
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg flex items-center justify-center">
        <ScrollReveal>
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="h-8 w-8 text-green-600" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-px-fg mb-2">Account Created!</h2>
              <p className="text-px-muted mb-6">
                We've sent a verification email to <strong>{formData.email}</strong>. 
                Please check your inbox and click the verification link to activate your account.
              </p>
              
              <div className="space-y-4">
                <Button asChild className="w-full bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white">
                  <Link href="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-px-fg">Create Account</h1>
              <p className="text-px-muted">Join Pixel Print to manage your orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScrollReveal>
          <Card>
            <CardHeader className="bg-gradient-to-r from-px-cyan/10 to-px-magenta/10">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-px-cyan" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-px-fg">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                      className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-px-fg">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                      className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-px-fg">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-px-fg">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                    />
                  </div>
                </div>

                {/* Company Information */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-px-fg">
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-px-fg">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                  />
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-px-fg">
                      Password *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-px-fg">
                      Confirm Password *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-px-muted">
                    I agree to the{" "}
                    <Link href="/terms" className="text-px-cyan hover:underline">
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-px-cyan hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Create Account
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

                {/* Google Sign Up */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignUp}
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

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-sm text-px-muted">
                    Already have an account?{" "}
                    <Link href="/login" className="text-px-cyan hover:underline font-medium">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}
