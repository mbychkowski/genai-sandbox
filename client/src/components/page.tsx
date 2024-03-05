import Header from '@/components/header';
import styles from '@/components/page.module.css';
import { ILinks, IHeader } from '@/types/types';

export default function Page({
  children,
  links,
  header,
}: {
  children: React.ReactNode;
  links: ILinks[];
  header: IHeader;
}) {
  return (
    <div className={styles.body}>
      <Header header={header} links={links} />
      <main>{children}</main>
    </div>
  );
}
