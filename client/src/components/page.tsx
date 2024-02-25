import styles from './page.module.css';

export default function Page({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className={styles.main}>{children}</main>;
}
