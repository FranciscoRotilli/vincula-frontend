import '@testing-library/jest-dom/vitest'; // <-- integra os matchers ao expect

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
