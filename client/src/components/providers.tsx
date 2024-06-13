'use client';

import * as React from 'react'
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/authProvider';

export function Providers({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      themes={['light', 'dark']}
      defaultTheme="dark"
      enableSystem={false}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}