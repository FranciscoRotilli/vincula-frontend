import { CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';

import Button from '@/components/Button';
import { t } from '@/texts';

import styles from './GraphAlerts.module.css';

interface GraphAlertsProps {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  hasActiveFilters: boolean;
  hasNodes: boolean;
  caseId: string;
}

export const GraphAlerts: React.FC<GraphAlertsProps> = ({
  isLoading,
  hasError,
  errorMessage,
  hasActiveFilters,
  hasNodes,
  caseId,
}) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className={styles.container} data-testid="graph-alert-cointainer">
        <div className={styles.loadingContent} data-testid="graph-alert-loading">
          <CircularProgress size={40} />
          <span>{t('graph.loading')}</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={styles.container} data-testid="graph-alert-cointainer-error">
        <div className={styles.errorContent} data-testid="graph-alert-error">
          <span className={styles.errorTitle}>{t('graph.errorTitle')}</span>
          <span className={styles.errorMessage}>
            {errorMessage || t('graph.errorUnknown')}
          </span>
        </div>
      </div>
    );
  }

  if (hasActiveFilters && !hasNodes) {
    return (
      <div className={styles.container} data-testid="graph-alert-cointainer">
        <div className={styles.warningContent} data-testid="graph-alert-warning">
          <span className={styles.warningTitle}>{t('graph.noResults')}</span>
          <span className={styles.warningDescription}>
            {t('graph.noResultsDescription')}
          </span>
          <span className={styles.warningHint}>
            {t('graph.noResultsHint')}
          </span>
        </div>
      </div>
    );
  }

  if (!hasActiveFilters && !hasNodes) {
    return (
      <div className={styles.container} data-testid="graph-alert-cointainer">
        <div className={styles.emptyContent} data-testid="graph-alert-empty">
          <span className={styles.emptyIcon}>📊</span>
          <span className={styles.emptyTitle}>{t('graph.noData')}</span>
          <span className={styles.emptyDescription}>
            {t('graph.noDataDescription')}
          </span>
          <div className={styles.buttonContainer} data-testid="graph-alert-button">
            <Button
              label={t('graph.goToGeneralInfo')}
              variant="contained"
              onClick={() => router.push(`/casos/${caseId}`)}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
