import './bootstrap';
import '../css/app.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { InertiaProgress } from '@inertiajs/progress';

const primaryColor = '#6366f1';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: primaryColor,
        },
        secondary: {
            main: '#0ea5e9',
        },
        background: {
            default: '#030712',
            paper: '#0f172a',
        },
    },
    shape: {
        borderRadius: 16,
    },
    typography: {
        fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
        fontWeightRegular: 500,
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))',
                    border: '1px solid rgba(148, 163, 184, 0.12)',
                    boxShadow: '0 20px 35px -20px rgba(59, 130, 246, 0.45)',
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 9999,
                    fontWeight: 600,
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                bar: {
                    borderRadius: 9999,
                },
                root: {
                    borderRadius: 9999,
                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                },
            },
        },
    },
});

const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });

InertiaProgress.init({
    color: primaryColor,
    showSpinner: false,
});

createInertiaApp({
    resolve: (name) => {
        const page = pages[`./Pages/${name}.jsx`];

        if (!page) {
            throw new Error(`Unable to locate Inertia page: ${name}`);
        }

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <App {...props} />
                </ThemeProvider>
            </StrictMode>,
        );
    },
});