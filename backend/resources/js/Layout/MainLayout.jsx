import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    AppBar,
    Avatar,
    Box,
    Button,
    Collapse,
    Container,
    IconButton,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import { Link, Head, router, usePage } from '@inertiajs/react';

const gradientBorder = 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(14,165,233,0.4))';

export default function MainLayout({ title = 'Dashboard', children }) {
    const { props } = usePage();
    const { auth = {}, flash = {} } = props ?? {};
    const user = auth?.user;

    const [clientFlash, setClientFlash] = useState(null);
    const flashMessage = useMemo(
        () => clientFlash?.message ?? flash?.error ?? flash?.success ?? null,
        [clientFlash?.message, flash?.error, flash?.success]
    );
    const flashSeverity = clientFlash?.type ?? (flash?.error ? 'error' : 'success');
    const [flashOpen, setFlashOpen] = useState(Boolean(flashMessage));

    useEffect(() => {
        setFlashOpen(Boolean(flashMessage));
    }, [flashMessage]);

    useEffect(() => {
        const handler = (event) => {
            const detail = event?.detail ?? {};

            if (!detail?.message) {
                return;
            }

            setClientFlash({
                type: detail.type ?? 'success',
                message: detail.message,
            });
        };

        window.addEventListener('jobsphere:flash', handler);

        return () => {
            window.removeEventListener('jobsphere:flash', handler);
        };
    }, []);

    const handleFlashClose = () => {
        setFlashOpen(false);

        if (clientFlash) {
            setClientFlash(null);
        }
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
            <Head title={title} />
            <AppBar
                position="sticky"
                color="transparent"
                elevation={0}
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'rgba(148, 163, 184, 0.15)',
                    backdropFilter: 'blur(12px)',
                    backgroundImage: gradientBorder,
                }}
            >
                <Toolbar sx={{ minHeight: 72, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '16px',
                                display: 'grid',
                                placeItems: 'center',
                                backgroundImage: gradientBorder,
                                border: '1px solid rgba(99, 102, 241, 0.35)',
                                color: 'white',
                            }}
                        >
                            <WorkOutlineRoundedIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography component="span" variant="subtitle2" color="text.secondary">
                                {props?.app?.name ?? 'Jobsphere'}
                            </Typography>
                            <Typography component="div" variant="h6" fontWeight={700}>
                                Career Dashboard
                            </Typography>
                        </Box>
                    </Stack>

                    <Box sx={{ flex: 1 }} />

                    {user ? (
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Stack spacing={0.5} textAlign="right">
                                <Typography fontWeight={600}>{user.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user.email}
                                </Typography>
                            </Stack>
                            <Avatar src={user.avatar ?? undefined} alt={user.name} sx={{ width: 40, height: 40 }} />
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<LogoutRoundedIcon />}
                                onClick={handleLogout}
                            >
                                Sign out
                            </Button>
                        </Stack>
                    ) : (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Button
                                component={Link}
                                href="/auth/github/redirect"
                                variant="contained"
                                color="primary"
                                startIcon={<LoginRoundedIcon />}
                            >
                                Sign in with GitHub
                            </Button>
                            <Button component={Link} href="/auth/google/redirect" variant="outlined" color="secondary">
                                Google
                            </Button>
                        </Stack>
                    )}
                </Toolbar>
            </AppBar>

            <Container component="main" maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
                <Collapse in={flashOpen} unmountOnExit>
                    {flashMessage && (
                        <Alert
                            severity={flashSeverity === 'error' ? 'error' : flashSeverity}
                            variant="filled"
                            sx={{ mb: 4, borderRadius: 3 }}
                            action={
                                <IconButton
                                    size="small"
                                    color="inherit"
                                    onClick={handleFlashClose}
                                >
                                    <CloseRoundedIcon fontSize="small" />
                                </IconButton>
                            }
                        >
                            {flashMessage}
                        </Alert>
                    )}
                </Collapse>

                {children}
            </Container>
        </Box>
    );
}