'use client';

import React, { useState } from 'react';
import { FiFilter } from 'react-icons/fi';

import { t } from '../../texts';
import Button from '../Button';
import Input from '../Input';
import { CustomSelect } from '../Select';
import styles from './GraphFilter.module.css';

export default function GraphFilter() {
	const [investigado, setInvestigado] = useState<string | null>(null);
	const [investigadosList, setInvestigadosList] = useState<string[]>([]);
  const [database, setDatabase] = useState<string | null>(null);

  return (
    <section className={styles.frame}>
      <div className={styles.row}>
        <div className={styles.groupInvestigado}>
          <label className={styles.label}>{t('graph.filter.investigated')}</label>
          <CustomSelect
            options={investigadosList.map((item) => ({ value: item, label: item }))}
            value={investigado}
            onChange={(v) => setInvestigado(v)}
            placeholder={''} 
            name="investigado"
            id="investigado"
            isControlled
            style={{ maxHeight: '40px', fontSize: '14px' }}
          />
        </div>

        <div className={styles.groupCpf}>
          <label className={styles.label}>{t('graph.filter.cpfCnpj')}</label>
          <Input
            placeholder={t('graph.filter.cpfCnpjDescription')}
            height={40}
            size="small"
						variant="outlined"
						
          />
        </div>

        <div className={styles.groupDestino}>
          <label className={styles.label}>{t('graph.filter.destination')}</label>
          <Input
            placeholder={t('graph.filter.destinationDescription')}
            height={40}
            size="small"
            variant="outlined"
          />
        </div>

        <div className={styles.groupDb}>
          <label className={styles.label}>{t('graph.filter.database')}</label>
          <CustomSelect
            options={[]}
            value={database}
            onChange={(v) => setDatabase(v)}
            placeholder={t('graph.filter.databaseDescription')}
            name="database"
            id="database"
            isControlled
            style={{ maxHeight: '40px', color: 'var(--text-color-placeholder)' }}
          />
        </div>

        <div className={styles.controls}>
          <Button
            icon={<FiFilter />}
            variant="outlined"
            size="icon"
            label={''}
            onClick={() => {}}
          />
          <Button
            icon={<FiFilter />}
            variant="contained"
            size="icon"
            label={''}
            onClick={() => {}}
          />
        </div>
      </div>
    </section>
  );
}
