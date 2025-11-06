import { createTheme } from '@mui/material/styles';

// Material You (Material Design 3) Theme
// 使用动态颜色和现代化的设计语言
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4', // Material You Purple
      light: '#9A82DB',
      dark: '#4F378B',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#625B71',
      light: '#E8DEF8',
      dark: '#4A4458',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#B3261E',
      light: '#F2B8B5',
      dark: '#8C1D18',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F9A825',
      light: '#FDD835',
      dark: '#F57F17',
    },
    info: {
      main: '#0288D1',
      light: '#4FC3F7',
      dark: '#01579B',
    },
    success: {
      main: '#2E7D32',
      light: '#66BB6A',
      dark: '#1B5E20',
    },
    background: {
      default: '#FEF7FF', // Material You light surface
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1B1F',
      secondary: '#49454F',
    },
  },
  shape: {
    borderRadius: 16, // Material You uses larger border radius
  },
  typography: {
    fontFamily: [
      'Roboto',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '3rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 400,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Material You uses sentence case
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20, // Pill-shaped buttons
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px rgba(0, 0, 0, 0.15)',
          },
        },
        sizeLarge: {
          padding: '14px 28px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px rgba(0, 0, 0, 0.15)',
        },
        elevation2: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 4px 8px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3), 0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
  },
});

// 自定义猎人和逃亡者主题色
export const hunterColor = '#D32F2F'; // Red
export const runnerColor = '#1976D2'; // Blue
