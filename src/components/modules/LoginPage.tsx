'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Building2,
  AlertTriangle,
  Lock,
  Fingerprint,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

// ── Animated background grid ──────────────────────────────────────────────
function BackgroundGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle, #007749 0%, transparent 70%)',
          top: '10%',
          left: '-10%',
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, #FFB81C 0%, transparent 70%)',
          bottom: '5%',
          right: '-5%',
        }}
        animate={{
          x: [0, -35, 0],
          y: [0, 25, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{
          background: 'radial-gradient(circle, #002395 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px opacity-[0.08]"
        style={{
          background: 'linear-gradient(90deg, transparent, #FFB81C, transparent)',
        }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// ── Stat pill component ───────────────────────────────────────────────────
function StatPill({
  icon: Icon,
  value,
  label,
  delay,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 backdrop-blur-sm"
    >
      <div className="flex size-8 items-center justify-center rounded-md bg-white/[0.06]">
        <Icon className="size-4 text-[#FFB81C]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{value}</p>
        <p className="text-[11px] text-white/40">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Main LoginPage ────────────────────────────────────────────────────────
export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    onLogin();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background gradient — SA flag colors: navy → green → gold */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #001233 0%, #002395 25%, #003d2e 50%, #007749 75%, #1a4a1a 100%)',
        }}
      />

      {/* Background grid & effects */}
      <BackgroundGrid />

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-8 px-4 lg:flex-row lg:gap-16 lg:px-8">
        {/* Left side — Branding & Stats */}
        <motion.div
          className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.7, type: 'spring', stiffness: 120 }}
            className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-[#FFB81C]/30 bg-[#FFB81C]/10"
          >
            <Fingerprint className="size-8 text-[#FFB81C]" />
          </motion.div>

          {/* Brand name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-2 text-4xl font-bold tracking-tight text-white lg:text-5xl"
          >
            CivicLens{' '}
            <span className="bg-gradient-to-r from-[#FFB81C] to-[#007749] bg-clip-text text-transparent">
              SA
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mb-8 max-w-md text-base text-white/50 lg:text-lg"
          >
            The Intelligence Layer for South Africa&apos;s Public Sector
          </motion.p>

          {/* Stats */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <StatPill
              icon={Building2}
              value="257"
              label="Municipalities Monitored"
              delay={0.6}
            />
            <StatPill
              icon={Shield}
              value="R478B+"
              label="Active Tenders Tracked"
              delay={0.7}
            />
            <StatPill
              icon={AlertTriangle}
              value="234"
              label="Risk Signals Active"
              delay={0.8}
            />
          </div>
        </motion.div>

        {/* Right side — Sign In Card */}
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
            {/* Card header */}
            <motion.div
              className="mb-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full border border-[#007749]/30 bg-[#007749]/10">
                <Lock className="size-4 text-[#007749]" />
              </div>
              <h2 className="text-xl font-semibold text-white">Welcome back</h2>
              <p className="mt-1 text-sm text-white/40">
                Sign in to access your intelligence dashboard
              </p>
            </motion.div>

            {/* Sign In form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Label htmlFor="email" className="text-xs font-medium text-white/60">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="analyst@civiclens.co.za"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 border-white/[0.1] bg-white/[0.04] text-white placeholder:text-white/20 focus-visible:border-[#007749]/50 focus-visible:ring-[#007749]/20"
                />
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Label htmlFor="password" className="text-xs font-medium text-white/60">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 border-white/[0.1] bg-white/[0.04] pr-10 text-white placeholder:text-white/20 focus-visible:border-[#007749]/50 focus-visible:ring-[#007749]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Forgot password */}
              <motion.div
                className="flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <button
                  type="button"
                  className="text-xs text-white/30 transition-colors hover:text-[#FFB81C]"
                >
                  Forgot Password?
                </button>
              </motion.div>

              {/* Sign In button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 w-full bg-gradient-to-r from-[#007749] to-[#005c37] text-white shadow-lg shadow-[#007749]/20 hover:from-[#008c55] hover:to-[#007749] transition-all duration-300"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="size-4 animate-spin" />
                        Authenticating...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Shield className="size-4" />
                        Sign In
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div
              className="relative my-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95, duration: 0.5 }}
            >
              <Separator className="bg-white/[0.08]" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent px-3 text-[11px] text-white/20">
                or continue with
              </span>
            </motion.div>

            {/* Social login buttons */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <Button
                type="button"
                variant="outline"
                className="h-9 border-white/[0.1] bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white"
                onClick={() => {}}
              >
                <svg className="size-4 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 border-white/[0.1] bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white"
                onClick={() => {}}
              >
                <svg className="size-4 mr-2" viewBox="0 0 24 24">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" fill="#00A4EF" />
                </svg>
                Microsoft
              </Button>
            </motion.div>

            {/* Request access link */}
            <motion.p
              className="mt-6 text-center text-xs text-white/25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="text-[#FFB81C]/60 transition-colors hover:text-[#FFB81C]"
              >
                Request Access
              </button>
            </motion.p>
          </div>

          {/* POPIA notice */}
          <motion.div
            className="mt-4 rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-2.5 text-center backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <p className="text-[10px] leading-relaxed text-white/25">
              <Shield className="mr-1 inline-block size-3 text-[#007749]/50" />
              This platform is POPIA compliant. Your personal information is processed in accordance
              with the Protection of Personal Information Act, 2013. Data is hosted within the
              Republic of South Africa.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
