import { createTheme } from '@mui/material/styles';

export const colors = {
  BACKGROUND: '#FAFAFA',
  SELECTIVE_YELLOW: '#FFB703',
  UT_ORANGE: '#FB8500',
  VERMILION: '#F33131',
  LIGHT_GREEN: '#8CDC88',
  LIME_GREEN: '#3DBB02',
  WHITE: '#FFFFFF',
  ANTI_FLASH_WHITE: '#F1F1F1',
  GRAY: '#808080',
  EERIE_BLACK: '#1A1A1A',
  BLACK: '#000000',
} as const;

const theme = createTheme({
  palette: {
    primary:   { main: colors.SELECTIVE_YELLOW, contrastText: colors.BLACK },
    secondary: { main: colors.UT_ORANGE,        contrastText: colors.WHITE },
    error:     { main: colors.VERMILION },
    success:   { main: colors.LIME_GREEN },
    warning:   { main: colors.SELECTIVE_YELLOW },
    background:{ default: colors.BACKGROUND, paper: colors.ANTI_FLASH_WHITE },
    text:      { primary: colors.EERIE_BLACK, secondary: colors.GRAY },
    common:    { black: colors.BLACK, white: colors.WHITE },
  },
  // tipografia/overrides opcionais
  // typography: { fontFamily: '...' },
  // components: { MuiButton: { styleOverrides: { root: { borderRadius: 8 } } } },
});

export default theme;
