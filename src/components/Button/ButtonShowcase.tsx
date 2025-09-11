'use client';
import React from 'react';
import { FiEdit2, FiXCircle } from 'react-icons/fi';

import Button from '.';

const ButtonShowcase = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
    <Button label="Contained" onClick={() => alert('Contained')} />
    <Button label="Contained" variant="contained" onClick={() => {}} />
    <Button label="Outlined" variant="outlined" onClick={() => {}} />
    <Button label="Error" variant="error" onClick={() => {}} />
    <Button label="Edit" icon={<FiEdit2 />} onClick={() => {}} />
    <Button label="Delete" icon={<FiXCircle />} variant="error" onClick={() => {}} />
    <Button label="Small" size="small" onClick={() => {}} />
    <Button label="Large" size="large" onClick={() => {}} />
    <Button label="Disabled" disabled onClick={() => {}} />
  </div>
);

export default ButtonShowcase;
