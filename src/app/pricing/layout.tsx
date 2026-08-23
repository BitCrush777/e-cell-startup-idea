import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TempLink Pricing — Free, Pro & Business',
  description:
    'Choose a TempLink plan for temporary private communication, from free 3-member rooms to Pro rooms with up to 10 members.',
  openGraph: {
    title: 'TempLink Pricing — Free, Pro & Business',
    description:
      'Choose a TempLink plan for temporary private communication, from free 3-member rooms to Pro rooms with up to 10 members.',
    url: 'https://templink.in/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
