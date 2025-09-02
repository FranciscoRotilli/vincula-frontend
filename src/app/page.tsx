'use client'
import Image from 'next/image';
import React, { useState } from 'react';

import styles from './page.module.css';

import CreateCaseModal from '@/components/modalGenerico/CreateCaseModal';

export default function Lab() {
  const [open, setOpen] = useState(true);
return (
      <CreateCaseModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={(payload) => {
          console.log('Caso adicionado:', payload);
        }}
      />
  );
}