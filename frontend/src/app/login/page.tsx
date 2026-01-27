"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/login-form";
import { motion } from "framer-motion";
import { Truck, Globe, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLoginSuccess = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Hero/Branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 bg-zinc-900 relative overflow-hidden flex-col justify-between p-12 text-white"
      >
        {/* Background Gradients/Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-900 to-black" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent opacity-80" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">TMS Pro</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl font-extrabold leading-tight tracking-tight"
            >
              The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Logistics</span> Management
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-zinc-400 text-lg leading-relaxed"
            >
              Streamline your supply chain with our advanced tracking, analytics, and fleet management platform.
              Designed for modern logistics teams.
            </motion.p>
          </div>
        </div>

        {/* Features / Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative z-10 grid grid-cols-2 gap-8"
        >
          <div className="flex items-center gap-4 group">
            <div className="h-12 w-12 rounded-2xl bg-zinc-800/50 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
              <Globe className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200">Global Reach</h3>
              <p className="text-sm text-zinc-500">Track shipments worldwide</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="h-12 w-12 rounded-2xl bg-zinc-800/50 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200">Secure & Reliable</h3>
              <p className="text-sm text-zinc-500">Enterprise-grade security</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-8 lg:p-12 relative">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[400px] relative z-10"
        >
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">Sign in to access your dashboard</p>
          </div>
          <LoginForm onSuccess={handleLoginSuccess} />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="/register" className="font-medium text-primary hover:text-primary/90 underline-offset-4 hover:underline transition-all">
              Contact Sales
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
