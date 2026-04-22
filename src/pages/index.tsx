import Link from 'next/link';

import styles from '@/styles/home.module.css';

export default function HomePage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.h1}>LP Admin</h1>
        <p className={styles.p}>
          Desktop admin UI. Backend is served by <code>LP_Services</code> on{' '}
          <code>{process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8787'}</code>.
        </p>
        <div className={styles.ctas}>
          <Link className={styles.primary} href="/login">
            Login
          </Link>
          <Link className={styles.secondary} href="/admin">
            Admin
          </Link>
        </div>
      </main>
    </div>
  );
}

