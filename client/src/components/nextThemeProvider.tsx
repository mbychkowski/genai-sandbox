'use client';

import { ThemeProvider } from 'next-themes';

export function NextThemeProvider({
  children,
}: Readonly<{
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
  );
}
