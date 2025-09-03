'use client';

import { GlobalStyles } from '@mui/material';

export function ThemeCssVars() {
  return (
    <GlobalStyles
      styles={(theme) => ({
        ':root': {
          '--color-background': theme.palette.background.default,
          '--color-anti-flash-white': theme.palette.background.paper,
          '--color-eerie-black': theme.palette.text.primary,
          '--color-gray': theme.palette.text.secondary,

          '--color-selective-yellow': theme.palette.primary.main,
          '--color-ut-orange': theme.palette.secondary.main,
          '--color-vermilion': theme.palette.error.main,
          '--color-light-green': theme.palette.success.light ?? '#8CDC88',
          '--color-lime-green': theme.palette.success.main, // LIME_GREEN
          '--color-white': theme.palette.common.white,
          '--color-black': theme.palette.common.black,
        },
      })}
    />
  );
}
