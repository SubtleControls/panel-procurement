import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Panel Procurement — Subtle Controls',
  description: 'BOM entry and shortage tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
