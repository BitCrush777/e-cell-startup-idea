import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How TempLink Works — Temporary Private Communication',
  description:
    'Learn how TempLink lets you create temporary private rooms, share a QR or room code, communicate in real time, and let rooms expire automatically.',
  openGraph: {
    title: 'How TempLink Works — Temporary Private Communication',
    description:
      'Learn how TempLink lets you create temporary private rooms, share a QR or room code, communicate in real time, and let rooms expire automatically.',
    url: 'https://templink.in/how-it-works',
  },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
