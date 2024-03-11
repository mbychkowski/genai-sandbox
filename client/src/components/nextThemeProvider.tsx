'use client';

import { ThemeProvider } from 'next-themes';

export function NextThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
