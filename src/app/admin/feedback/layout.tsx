import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Validation & Feedback Dashboard | TempLink Admin',
  description: 'Anonymous user feedback and startup validation analytics for TempLink.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminFeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
