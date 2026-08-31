'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export interface NavItem {
  href: string;
  label: string;
}

interface SplineNavigationProps {
  navLinks: NavItem[];
  className?: string;
  sceneUrl?: string;
}

export default function SplineNavigation({
  navLinks,
  className = '',
}: SplineNavigationProps) {
  const pathname = usePathname();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center p-1 rounded-full group ${className}`}
      style={{
        perspective: '1000px',
      }}
    >
      {/* Dynamic Specular Light Follower on Hover */}
      <motion.div
        className="absolute -z-10 w-24 h-24 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(99,102,241,0.15) 40%, transparent 70%)',
          left: mousePos.x - 48,
          top: mousePos.y - 48,
        }}
      />

      {/* Refractive Liquid Glass Body Frame */}
      <div
        className="relative flex items-center gap-1 p-1 rounded-full border border-white/10 shadow-2xl transition-all duration-300"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          boxShadow: `
            inset 0 1px 1px 0px rgba(255, 255, 255, 0.18),
            inset 0 -1px 1px 0px rgba(0, 0, 0, 0.2),
            0 12px 30px -10px rgba(0, 0, 0, 0.5)
          `,
        }}
      >
        {navLinks.map((link, idx) => {
          const isActive = pathname === link.href;
          const isHovered = hoveredIdx === idx;

          return (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHoveredIdx(idx)}
              className="relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none z-10"
              style={{
                color: isActive ? '#FFFFFF' : isHovered ? '#F8FAFC' : '#94A3B8',
              }}
            >
              {/* Active / Hover Liquid Indicator Pill */}
              {isActive && (
                <motion.div
                  layoutId="spline-nav-active-pill"
                  className="absolute inset-0 rounded-full -z-10 shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.35) 0%, rgba(56, 189, 248, 0.2) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 0 15px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Hover Pill if not active */}
              {!isActive && isHovered && (
                <motion.div
                  layoutId="spline-nav-hover-pill"
                  className="absolute inset-0 rounded-full -z-10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-1">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
