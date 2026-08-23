'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
}

export default function QrCode({
  value,
  size = 200,
  className = '',
  bgColor = '#ffffff',
  fgColor = '#05070B',
  level = 'H',
}: QrCodeProps) {
  if (!value) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-white rounded-2xl flex items-center justify-center text-slate-400 text-xs ${className}`}
      >
        <span>Generating QR...</span>
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-white/20 flex items-center justify-center transition-all ${className}`}
    >
      <QRCodeSVG
        key={value}
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level={level}
        includeMargin={false}
      />
    </div>
  );
}
