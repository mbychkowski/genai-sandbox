'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@/components/nav.module.css';
import { User } from 'firebase/auth';
import { ILinks } from '@/types/types';
import { signInWithGoogle, signOut, useAuth } from '@/lib/authProvider';

export default function Nav({
  links,
  initialUser
  }: {
    links: ILinks[];
    initialUser: User | null;
  }) {

  const user = useAuth(initialUser);

  console.log('Current logged in user:', user)

    const handleSignOut = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
      signOut();
  }

  const handleSignIn = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    signInWithGoogle();;
  }

  return (
    <header>
      {
        user?.toJSON() ? (
          <ul className={styles.ul}>
            {links.map((link) => (

              (user && link.protected) ? (
                <li key={link.name}>
                  <Link href={link.route}>{link.name}</Link>
                </li>
              ) : (
                <li key={link.name}>
                  <Link href={link.route}>{link.name}</Link>
                </li>
              )
            ))}
            <li>
              <a href="#" onClick={handleSignOut}>
                Sign out
              </a>
            </li>
          </ul>
        ) : (
          <div>
            <a href="#" onClick={handleSignIn}>
              Sign in with Google
            </a>
          </div>
        )
      }

    </header>
  );
}
