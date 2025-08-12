import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'VoxelWorld',
  description: 'Explore a procedural voxel world with realistic terrain',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
