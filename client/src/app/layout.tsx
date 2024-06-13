import type { Metadata } from 'next';
import { Noto_Sans_Mono } from 'next/font/google';
import { getAuthenticatedAppForUser } from "@/lib/firebaseServerAuth";
import Page from '@/components/page';
import Switch from '@/components/switch';

import '@/app/globals.css';
import { Providers } from '@/components/providers';

// Force next.js to treat this route as server-side rendered
// Without this line, during the build process, next.js will treat this route as
// static and build a static HTML file for it
export const dynamic = "force-dynamic";

const LINKS = [
  {
    protected: false,
    name: 'posts',
    route: '/posts',
  },
  {
    protected: true,
    name: 'profile',
    route: '/profile',
  },
];

const HEADER = {
  title: 'home',
};

const notoSansMono = Noto_Sans_Mono({
  subsets: ['latin'],
  weight: ['100', '300', '500', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Testing grounds',
  description: 'Testing grounds for GenAI',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentUser } = await getAuthenticatedAppForUser();


  return (
    <html suppressHydrationWarning lang="en">
      <body className={notoSansMono.className}>
        <Providers>
          <Switch />
          <Page header={HEADER} links={LINKS} initialUser={currentUser}>
            {children}
          </Page>
        </Providers>
      </body>
    </html>
  );
}
