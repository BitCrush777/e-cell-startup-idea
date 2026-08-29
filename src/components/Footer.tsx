'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on active chat screen for focused experience
  if (pathname?.startsWith('/room/') && !pathname.endsWith('/expired')) {
    return null;
  }

  return (
    <footer className="border-t border-white/10 py-10 px-4 md:px-8 text-xs text-slate-500 bg-[#05070B] relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <Link href="/" className="font-display font-bold text-slate-200 hover:text-primary-light transition-colors text-sm">
              TempLink
            </Link>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-slate-400">Create. Connect. Communicate. Disappear.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-xs">
            <Link href="/about" className="hover:text-primary-light transition-colors font-medium">
              About TempLink
            </Link>
            <Link href="/#how-it-works" className="hover:text-slate-300 transition-colors">
              How It Works
            </Link>
            <Link href="/security" className="hover:text-slate-300 transition-colors">
              Security
            </Link>
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">
              Pricing
            </Link>
            <Link href="/business" className="hover:text-slate-300 transition-colors">
              Business
            </Link>
            <Link href="/security#privacy" className="hover:text-slate-300 transition-colors">
              Privacy
            </Link>
            <Link href="/security#terms" className="hover:text-slate-300 transition-colors">
              Terms
            </Link>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} TempLink. Temporary private communication platform.
          </div>
          <div className="text-slate-400 font-medium">
            Designed &amp; Developed by <span className="text-slate-200 font-semibold">Sai Darshan.k</span> • <span className="text-slate-400">Built with the TempLink team</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
