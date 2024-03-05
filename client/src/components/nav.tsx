import Link from 'next/link';
import styles from '@/components/nav.module.css';
import { ILinks } from '@/types/types';

export default function Nav({ links }: { links: ILinks[] }) {
  return (
    <ul className={styles.ul}>
      {links.map((link) => (
        <li key={link.name}>
          <Link href={link.route}>{link.name}</Link>
        </li>
      ))}
    </ul>
  );
}
