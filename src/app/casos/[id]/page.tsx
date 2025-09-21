import React from 'react';

import { CaseContainer } from '@/components/CaseContainer';
import styles from '@/components/CaseContainer/CaseContainer.module.css';
import FilesSection from '@/components/FilesSection';

export default async function GeneralInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseContainer caseId={id}>
      <div className={styles.pageGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <div className={styles.cardBody}>
              <h2 className={styles.caseTitle}></h2>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}></h3>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.cardPlaceholder}></p>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}></h3>
            </div>
            <div className={styles.cardBody}></div>
          </div>

          <div className={styles.card}>
            <FilesSection caseId={id} />
          </div>
        </div>
      </div>
    </CaseContainer>
  );
}
