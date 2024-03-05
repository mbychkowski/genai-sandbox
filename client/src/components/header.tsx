import Link from 'next/link';
import Image from 'next/image';
import Nav from '@/components/nav';
import styles from '@/components/header.module.css';
import { ILinks, IHeader } from '@/types/types';

function Logo({ header }: { header: IHeader }) {
  if (header.logo) {
    return (
      <Image src={header.logo} alt={header.alt || header.title} />
    );
  }

  if (header.title) {
    return <h1>{header.title}</h1>;
  }
}

export default function Header({
  header,
  links,
}: {
  header: IHeader;
  links: ILinks[];
}) {
  return (
    <nav className={styles.nav}>
      <Link href="/">
        <div className={styles.logo}>
          <Logo header={header} />
        </div>
      </Link>
      <Nav links={links} />
    </nav>
  );
}
