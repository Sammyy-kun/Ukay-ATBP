import type { Metadata } from 'next';
import { DM_Sans, Poppins } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'sn4g',
  description: 'Fast mobile listing, camera capture, and real-time inventory management for Philippine thrift stores.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", dmSans.variable)}>
      <body className={`${dmSans.className} ${poppins.variable} antialiased`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
