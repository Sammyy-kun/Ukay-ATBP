import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ukay-Ukay Thrift Retail Platform',
  description: 'Fast mobile listing, camera capture, and real-time inventory management for Philippine thrift stores.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
