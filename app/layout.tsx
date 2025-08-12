import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Voxel Earth',
  description: 'Fly above a procedural voxel earth heightmap',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
