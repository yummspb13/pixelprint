"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login successful!');
        onClose();
        setEmail('');
        setPassword('');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type: 'user' | 'admin') => {
    setLoading(true);
    try {
      console.log("🔐 DEMO LOGIN:", type);
      const success = await login(
        type === 'admin' ? 'admin@pixelprint.com' : 'user@pixelprint.com',
        type === 'admin' ? 'admin123' : 'user123'
      );
      if (success) {
        console.log("✅ DEMO LOGIN SUCCESS:", type);
        toast.success(`${type === 'admin' ? 'Admin' : 'User'} login successful!`);
        onClose();
      } else {
        console.log("❌ DEMO LOGIN FAILED:", type);
        toast.error('Demo login failed');
      }
    } catch (error) {
      console.error("💥 DEMO LOGIN ERROR:", error);
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-px-fg">
            Welcome Back
          </DialogTitle>
          <p className="text-center text-px-muted">
            Sign in to your account to continue
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-px-fg">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border-zinc-300 focus:border-px-cyan focus:ring-px-cyan"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-px-fg">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 border-zinc-300 focus:border-px-cyan focus:ring-px-cyan"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Login Buttons */}
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-500">Demo Accounts</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDemoLogin('user')}
              disabled={loading}
              className="text-xs"
            >
              Demo User
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="text-xs"
            >
              Demo Admin
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-px-muted mb-3">
            Don't have an account? Create one now!
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onSwitchToRegister}
            className="w-full border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white"
          >
            Create New Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
