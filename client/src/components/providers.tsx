'use client';

import * as React from 'react'
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      themes={['light', 'dark']}
      defaultTheme="dark"
      enableSystem={false}
    >
      {children}
    </ThemeProvider>
  )
}