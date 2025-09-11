import './globals.css';
import '@/styles/theme.css';

import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import React from 'react';

import Providers from './providers';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Vincula',
  description: 'Login Vincula',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
