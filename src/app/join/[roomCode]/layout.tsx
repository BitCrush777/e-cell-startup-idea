import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join Room — TempLink',
  robots: {
    index: false,
    follow: false,
  },
};

export default function JoinRoomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
