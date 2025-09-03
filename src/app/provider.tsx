'use client';

import { CssBaseline,ThemeProvider } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { ReactNode } from 'react';

import theme from '../theme/theme';
import { ThemeCssVars } from '../theme/ThemeCssVars'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ThemeCssVars />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
