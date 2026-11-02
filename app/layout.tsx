import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Enterprise Warranty Hub (EWH)',
  description: 'Centralized Enterprise Equipment Warranty & Maintenance Knowledge Hub with pgvector',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-black">
      <body className="bg-black text-[#F5F5F7] min-h-screen antialiased selection:bg-[#00F0FF]/20 selection:text-[#00F0FF]">
        {children}
      </body>
    </html>
  );
}
