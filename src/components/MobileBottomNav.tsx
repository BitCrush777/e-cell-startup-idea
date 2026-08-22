'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide mobile bottom nav on active chat screen for maximum composer space
  if (pathname?.startsWith('/room/') && !pathname.endsWith('/expired')) {
    return null;
  }

  const items = [
    { label: 'Home', icon: 'home', href: '/' },
    { label: 'Join', icon: 'vpn_key', href: '/join' },
    { label: 'Create', icon: 'add_circle', href: '/create', isPrimary: true },
    { label: 'Scan', icon: 'qr_code_scanner', href: '/scan' },
    { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080B12]/90 backdrop-blur-xl border-t border-white/10 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const isActive = pathname === item.href;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5 group"
                aria-label="Create Private Room"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-white/20 group-active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">add</span>
                </div>
                <span className="text-[10px] font-bold text-primary-light mt-1">Create</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] rounded-xl px-2 py-1 transition-colors ${
                isActive ? 'text-white font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isActive ? 'text-primary-light scale-110' : ''
                } transition-transform`}
              >
                {item.icon}
              </span>
              <span className="text-[9px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
