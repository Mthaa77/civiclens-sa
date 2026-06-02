'use client';

import React from 'react';
import { Shield, Server, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-auto">
      {/* Gradient top border — SA colors: navy → green → gold → green → navy */}
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, #002395 15%, #007749 35%, #FFB81C 50%, #007749 65%, #002395 85%, transparent 100%)',
        }}
      />

      {/* Glass morphism background */}
      <div className="bg-[#0a0e1a]/80 backdrop-blur-md">
        <div className="flex flex-col items-center justify-between gap-1 px-4 py-2 sm:flex-row lg:px-6">
          {/* Left — Copyright */}
          <div className="flex items-center gap-1.5 text-[11px] text-white/30">
            <span>&copy; 2026 Carter Digitals (Pty) Ltd</span>
            <span className="text-white/10">&middot;</span>
            <span className="text-[#007749]/60 font-medium">B-BBEE Level 1 EME</span>
          </div>

          {/* Center — Data residency & compliance */}
          <div className="flex items-center gap-1.5 text-[11px] text-white/25">
            <Server className="size-3 text-white/15" />
            <span>Data Residency: GCP africa-south1</span>
            <span className="text-white/10">&middot;</span>
            <Shield className="size-3 text-[#007749]/40" />
            <span className="text-[#007749]/50 font-medium">POPIA Compliant</span>
          </div>

          {/* Right — Version & powered by */}
          <div className="flex items-center gap-1.5 text-[11px] text-white/25">
            <Cpu className="size-3 text-white/15" />
            <span>v2.4.0</span>
            <span className="text-white/10">&middot;</span>
            <span>
              Powered by{' '}
              <span className="bg-gradient-to-r from-[#FFB81C] to-[#007749] bg-clip-text font-medium text-transparent">
                CivicLens SA
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
