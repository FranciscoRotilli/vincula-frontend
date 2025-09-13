import React from 'react';

import { CaseContainer } from '@/components/CaseContainer';
import styles from '@/components/CaseContainer/CaseContainer.module.css';

export default async function GeneralInfoPage({ params }: { params: { id: string } }) {
  return (
    <CaseContainer caseId={params.id}>
      <div className={styles.pageGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <div className={styles.cardBody}>
              <h2 className={styles.caseTitle}>Operação Ratatouille</h2>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Investigados (2)</h3>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.cardPlaceholder}>
                Informe os investigados para possibilitar o vínculo com os ficheiros anexados.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Ações</h3>
            </div>
            <div className={styles.cardBody}>
               <p className={styles.cardPlaceholder}>
               </p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Ficheiros (2)</h3>
            </div>
            <div className={styles.cardBody}>
               <p className={styles.cardPlaceholder}>
                Os ficheiros em anexo serão usados para a geração de vínculos.
               </p>
            </div>
          </div>
        </div>
      </div>
    </CaseContainer>
  );
}

