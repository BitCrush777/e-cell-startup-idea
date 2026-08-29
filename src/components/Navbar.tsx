'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import HelpModal from './HelpModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide global navbar on active chat screen for focused experience
  if (pathname?.startsWith('/room/') && !pathname.endsWith('/expired')) {
    return null;
  }

  const navLinks = [
    { href: '/#product', label: 'Product' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/security', label: 'Security' },
    { href: '/#use-cases', label: 'Use Cases' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
  ];

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    await logout();
    router.push('/');
  };

  const getPlanBadge = () => {
    if (!user) return null;
    const plan = (user.plan || 'FREE').toUpperCase();
    if (plan === 'PRO') {
      return (
        <span className="text-[10px] font-mono font-bold bg-primary/20 text-primary-light px-2 py-0.5 rounded-md border border-primary/30">
          PRO
        </span>
      );
    }
    if (plan === 'BUSINESS') {
      return (
        <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/30">
          BUSINESS
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono font-bold bg-[#161E2E] text-slate-400 px-2 py-0.5 rounded-md border border-white/10">
        FREE
      </span>
    );
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080B12]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3'
          : 'bg-transparent border-b border-transparent py-4'
      }`}
    >
      <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-7xl mx-auto">
        {/* Logo with delicate glowing icon */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px]">lock</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-primary-light transition-colors">
              TempLink
            </span>
            <span className="text-[10px] uppercase font-mono font-bold bg-[#121824] text-primary-light px-1.5 py-0.5 rounded border border-white/10">
              v2
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 bg-[#0D111A]/60 p-1 rounded-xl border border-white/5 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#161E2E] text-white shadow-sm border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Action CTAs & Auth Controls */}
        <div className="flex gap-2.5 items-center">
          {/* Guest vs Signed-In Controls */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 bg-[#0D111A] hover:bg-[#121824] px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-white hidden sm:inline max-w-[100px] truncate">
                  {user.displayName}
                </span>
                {getPlanBadge()}
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  expand_more
                </span>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#080B12] border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 backdrop-blur-2xl animate-fade-in z-50">
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <span className="text-xs font-bold text-white block truncate">
                      {user.displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate font-mono">
                      {user.email}
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary-light">
                      dashboard
                    </span>
                    Dashboard
                  </Link>

                  <Link
                    href="/rooms"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary-light">
                      meeting_room
                    </span>
                    Rooms
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary-light">
                      settings
                    </span>
                    Settings & Plan
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-3 py-2 rounded-xl transition-colors text-left w-full mt-1 border-t border-white/5 pt-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors hidden sm:inline-block"
            >
              Sign In
            </Link>
          )}

          {/* Help / How it works dialog trigger */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors hidden sm:flex items-center gap-1 text-xs font-semibold"
            title="How TempLink Works"
            aria-label="How TempLink Works"
          >
            <span className="material-symbols-outlined text-[18px]">help_outline</span>
            <span className="hidden lg:inline">Help</span>
          </button>

          {/* Primary CTA (Unconditional) */}
          <Link
            href="/create"
            className="btn-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            <span>Create Room</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 p-2 rounded-lg hover:bg-white/5"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#080B12]/95 border-b border-white/10 px-4 py-4 flex flex-col gap-2 backdrop-blur-2xl animate-fade-in">
          {user && (
            <div className="p-3 bg-[#0D111A] rounded-xl border border-white/10 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-xs font-bold text-white">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{user.displayName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{user.email}</span>
                </div>
              </div>
              {getPlanBadge()}
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            {!user ? (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-ghost w-full py-2.5 text-xs font-semibold text-center"
              >
                Sign In to Account
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 py-2 text-center"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
