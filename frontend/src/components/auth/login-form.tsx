"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      // Error is already set in auth context
      console.error("Login failed:", err);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'employee') => {
    if (role === 'admin') {
      setEmail('admin@tms.com');
      setPassword('admin123');
    } else {
      setEmail('employee@tms.com');
      setPassword('employee123');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {(error || formError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError || error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className={cn("transition-colors", activeField === "email" ? "text-primary" : "")}>
              Email Address
            </Label>
            <div className="relative group">
              <Mail className={cn(
                "absolute left-3 top-3 h-4 w-4 transition-colors duration-200",
                activeField === "email" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setActiveField("email")}
                onBlur={() => setActiveField(null)}
                disabled={isLoading}
                autoComplete="email"
                required
                className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className={cn("transition-colors", activeField === "password" ? "text-primary" : "")}>
                Password
              </Label>
              <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative group">
              <Lock className={cn(
                "absolute left-3 top-3 h-4 w-4 transition-colors duration-200",
                activeField === "password" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setActiveField("password")}
                onBlur={() => setActiveField(null)}
                disabled={isLoading}
                autoComplete="current-password"
                required
                className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with demo</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => handleDemoLogin('admin')}
          disabled={isLoading}
          className="h-auto py-3 flex flex-col gap-1 items-start hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer"
        >
          <span className="font-semibold text-xs flex items-center gap-1">
            Admin
            {email === 'admin@tms.com' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
          </span>
          <span className="text-[10px] text-muted-foreground font-normal">Full access</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDemoLogin('employee')}
          disabled={isLoading}
          className="h-auto py-3 flex flex-col gap-1 items-start hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer"
        >
          <span className="font-semibold text-xs flex items-center gap-1">
            Employee
            {email === 'employee@tms.com' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
          </span>
          <span className="text-[10px] text-muted-foreground font-normal">Restricted access</span>
        </Button>
      </div>
    </div>
  );
}
