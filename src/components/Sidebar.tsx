'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface SidebarProps {
  userIdentity?: string;
}

export default function Sidebar({ userIdentity = 'SilverWave' }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { label: 'My Rooms', icon: 'meeting_room', href: '/rooms' },
    { label: 'Create Room', icon: 'add_box', href: '/create' },
    { label: 'Join Room', icon: 'login', href: '/join' },
    { label: 'QR Scanner', icon: 'qr_code_scanner', href: '/scan' },
    { label: 'Security', icon: 'shield', href: '/security' },
    { label: 'Pricing', icon: 'payments', href: '/pricing' },
    { label: 'Settings', icon: 'settings', href: '/settings' },
  ];

  return (
    <aside className="w-64 fixed left-0 top-0 h-full z-40 border-r border-white/10 bg-[#080B12] flex flex-col py-6 hidden md:flex shrink-0">
      <div className="px-6 mb-8 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px]">lock</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-tight group-hover:text-primary-light transition-colors">
              TempLink
            </h1>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Ephemeral Suite
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#161E2E] text-white border border-white/10 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-primary-light' : 'text-slate-400'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 pt-4 border-t border-white/10 mt-auto">
        {user ? (
          <Link
            href="/settings"
            className="flex items-center gap-3 p-2 rounded-xl bg-[#0D111A] border border-white/5 hover:border-white/20 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">
                {user.plan} Account
              </span>
              <span className="text-xs font-semibold text-slate-200 truncate">
                {user.displayName}
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#0D111A] border border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#161E2E] flex items-center justify-center text-primary-light font-bold text-xs shrink-0">
              <span className="material-symbols-outlined text-[16px]">fingerprint</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">
                Guest Pseudonym
              </span>
              <span className="text-xs font-semibold text-slate-300 truncate">
                {userIdentity}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
