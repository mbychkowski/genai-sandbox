import Header from '@/components/header';
import styles from '@/components/page.module.css';
import { ILinks, IHeader } from '@/types/types';
import { User } from 'firebase/auth';

export default function Page({
  children,
  links,
  header,
  initialUser,
}: {
  children: React.ReactNode;
  links: ILinks[];
  header: IHeader;
  initialUser: User | null;
}) {
  return (
    <div className={styles.body}>
      <Header header={header} links={links} initialUser={initialUser} />
      <main>{children}</main>
    </div>
  );
}
