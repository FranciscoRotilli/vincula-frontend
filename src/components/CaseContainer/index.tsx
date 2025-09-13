'use client';

import React from 'react';

import Footer from '@/components/Footer';
import NavbarContainer from '@/components/Navbar/NavbarComponent';

import styles from './CaseContainer.module.css';
import CaseTabs from './CaseTabs';

interface CaseContainerProps {
  children: React.ReactNode;
  caseId: string;
}

export function CaseContainer({ children, caseId }: CaseContainerProps) {
  return (
    <div data-testid="case-container">
      <NavbarContainer />
      <div className={styles.caseContainer}>
        <CaseTabs caseId={caseId} />
        <main className={styles.content}>{children}</main>
      </div>
      <Footer />
    </div>
  );
}

