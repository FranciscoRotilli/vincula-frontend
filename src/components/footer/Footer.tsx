import React from 'react';
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <p className={styles.text}>
          {currentYear} © Ministério Público do Estado do Rio Grande do Sul
        </p>
      </div>

      <div className={styles.right}>
        <Image
            src="/vincula.svg"
            alt="Vincula"
            width={140}
            height={22}
          />
          <Image
            src="/logo.svg"
            alt="Logomarca Vincula"
            width={54}
            height={54}
          />
      </div>
    </footer>
  );
}
