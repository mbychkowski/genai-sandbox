'use client';

import Link from 'next/link';
import styles from '@/components/nav.module.css';
import { User } from 'firebase/auth';
import { ILinks } from '@/types/types';
import { useAuth } from '@/lib/authProvider';
import React from 'react';

export default function Nav({
  links,
  initialUser
  }: {
    links: ILinks[];
    initialUser: User | null;
  }) {

  const user = useAuth(initialUser);

  console.log(user)

  return (
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
    </ul>
  );
}
