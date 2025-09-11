import Image from 'next/image';
import React from 'react';

import { t } from '@/texts';

import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <p className={styles.text}>
          {currentYear} {t('footer.copy')}
        </p>
      </div>
      <div className={styles.right}>
        <Image src="/logo.svg" alt="Logomarca Vincula" width={54} height={54} />
      </div>
    </footer>
  );
}
