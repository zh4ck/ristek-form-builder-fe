import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Form Builder | Create Beautiful Forms',
  description: 'The easiest way to create and manage professional aesthetic forms.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 text-gray-900`}>
        <AuthProvider>
          <Navbar />

          {/* Main application content area injected dynamically */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
