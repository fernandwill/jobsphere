import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import WorkHistoryRoundedIcon from '@mui/icons-material/WorkHistoryRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { useMemo, useState } from 'react';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { router, usePage } from '@inertiajs/react';
import MainLayout from '../Layout/MainLayout';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const STAT_ICONS = {
    growth: TrendingUpRoundedIcon,
    interviews: ScheduleRoundedIcon,
    offers: TaskAltRoundedIcon,
    pipeline: WorkHistoryRoundedIcon,
};

const PIPELINE_STATUS_META = {
    applied: { label: 'Applied', color: 'primary' },
    online_assessment: { label: 'Online Assessment', color: 'info' },
    interview: { label: 'Interview', color: 'secondary' },
    passed: { label: 'Passed', color: 'success' },
    rejected: { label: 'Rejected', color: 'error' },
};

const getPipelineStatusLabel = (status, fallback) =>
    PIPELINE_STATUS_META[status]?.label ?? fallback ?? status;

const getPipelineStatusColor = (status) =>
    PIPELINE_STATUS_META[status]?.color ?? 'default';

const APPLICATION_STATUS_OPTIONS = [
    { value: 'applied', label: 'Applied' },
    { value: 'online_assessment', label: 'Online Assessment' },
    { value: 'interview', label: 'Interview' },
    { value: 'passed', label: 'Passed' },
    { value: 'rejected', label: 'Rejected' },
];

const WORK_MODE_OPTIONS = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'Onsite' },
];

const MANUAL_APPLICATION_DEFAULTS = {
    company: '',
    job_title: '',
    location: '',
    mode: '',
    status: 'applied',
    job_url: '',
    applied_at: '',
    notes: '',
};

const normalizeErrors = (errors) =>
    Object.entries(errors ?? {}).reduce((accumulator, [key, value]) => {
        if (Array.isArray(value)) {
            accumulator[key] = value[0];
        } else if (value) {
            accumulator[key] = value;
        }

        return accumulator;
    }, {});

export default function Dashboard({
    stats = [],
    pipeline = [],
    activity = [],
    followUps = [],
    statusDistribution = [],
    applicationsByPeriod = [],
}) {
    const { props } = usePage();
    const csrfToken =
        props?.csrf_token ??
        (typeof document !== 'undefined'
            ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            : null);

    const [scrapeDialogOpen, setScrapeDialogOpen] = useState(false);
    const [scrapeKeyword, setScrapeKeyword] = useState('');
    const [scrapeSubmitting, setScrapeSubmitting] = useState(false);
    const [scrapeErrors, setScrapeErrors] = useState({});

    const [manualDialogOpen, setManualDialogOpen] = useState(false);
    const [manualForm, setManualForm] = useState(MANUAL_APPLICATION_DEFAULTS);
    const [manualSubmitting, setManualSubmitting] = useState(false);
    const [manualErrors, setManualErrors] = useState({});

    const dispatchFlash = (message, type = 'success') => {
        if (!message || typeof window === 'undefined') {
            return;
        }

        window.dispatchEvent(
            new CustomEvent('jobsphere:flash', {
                detail: { type, message },
            })
        );
    };

    const refreshDashboard = () => {
        if (typeof window === 'undefined') {
            return;
        }

        router.visit(window.location.href, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
        });
    };

    const handleScrapeSubmit = async (event) => {
        event.preventDefault();

        setScrapeSubmitting(true);
        setScrapeErrors({});

        try {
            await axios.post(
                '/api/scrapes',
                {
                    keyword: scrapeKeyword,
                },
                {
                    headers: csrfToken
                        ? {
                              'X-CSRF-TOKEN': csrfToken,
                          }
                        : undefined,
                }
            );

            setScrapeSubmitting(false);
            setScrapeDialogOpen(false);
            setScrapeKeyword('');
            dispatchFlash('Scrape queued successfully.');
            refreshDashboard();
        } catch (error) {
            const response = error?.response;
            const normalizedErrors = normalizeErrors(response?.data?.errors);
            const message =
                response?.data?.message ??
                error?.message ??
                'Unable to queue the scrape. Please try again.';

            setScrapeErrors({
                ...normalizedErrors,
                ...(normalizedErrors?.keyword ? {} : { general: message }),
            });
            setScrapeSubmitting(false);

            if (!normalizedErrors?.keyword) {
                dispatchFlash(message, 'error');
            }
        }
    };

    const handleManualFieldChange = (event) => {
        const { name, value } = event.target;

        setManualForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleManualSubmit = async (event) => {
        event.preventDefault();

        setManualSubmitting(true);
        setManualErrors({});

        const payload = {
            company: manualForm.company,
            job_title: manualForm.job_title,
            source: 'manual',
        };

        ['location', 'mode', 'status', 'job_url', 'applied_at', 'notes'].forEach((field) => {
            if (manualForm[field]) {
                payload[field] = manualForm[field];
            }
        });

        try {
            await axios.post('/api/applications', payload, {
                headers: csrfToken
                    ? {
                          'X-CSRF-TOKEN': csrfToken,
                      }
                    : undefined,
            });

            setManualSubmitting(false);
            setManualDialogOpen(false);
            setManualForm(MANUAL_APPLICATION_DEFAULTS);
            dispatchFlash('Application logged successfully.');
            refreshDashboard();
        } catch (error) {
            const response = error?.response;
            const normalizedErrors = normalizeErrors(response?.data?.errors);
            const message =
                response?.data?.message ??
                error?.message ??
                'Unable to save the application. Please try again.';

            setManualErrors({
                ...normalizedErrors,
                ...(Object.keys(normalizedErrors).length ? {} : { general: message }),
            });
            setManualSubmitting(false);

            if (!Object.keys(normalizedErrors).length) {
                dispatchFlash(message, 'error');
            }
        }
    };

    const statusChartData = useMemo(() => {
        if (!statusDistribution.length) {
            return null;
        }

        const labels = statusDistribution.map((item) => item.label);
        const counts = statusDistribution.map((item) => item.count);
        const backgroundColor = ['#818CF8', '#F472B6', '#FACC15', '#34D399', '#38BDF8'];

        return {
            labels,
            datasets: [
                {
                    label: 'Applications',
                    data: counts,
                    backgroundColor,
                    borderWidth: 0,
                },
            ],
        };
    }, [statusDistribution]);

    const applicationsTrendData = useMemo(() => {
        if (!applicationsByPeriod.length) {
            return null;
        }

        const labels = applicationsByPeriod.map((item) => item.label);
        const counts = applicationsByPeriod.map((item) => item.count);

        return {
            labels,
            datasets: [
                {
                    label: 'Applications submitted',
                    data: counts,
                    backgroundColor: 'rgba(99,102,241,0.35)',
                    borderColor: 'rgba(99,102,241,0.9)',
                    borderWidth: 2,
                    borderRadius: 8,
                },
            ],
        };
    }, [applicationsByPeriod]);

    return (
        <Stack spacing={5}>
            <Box>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                >
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Stay on top of your job hunt
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Monitor pipeline health, recent activity, and upcoming follow-ups in a single view.
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width={{ xs: '100%', md: 'auto' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setScrapeKeyword('');
                                setScrapeErrors({});
                                setScrapeDialogOpen(true);
                            }}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            Scrape company
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                                setManualForm(MANUAL_APPLICATION_DEFAULTS);
                                setManualErrors({});
                                setManualDialogOpen(true);
                            }}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            Log manual application
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                {stats.map((stat) => {
                    const Icon = STAT_ICONS[stat.icon] ?? TrendingUpRoundedIcon;

                    return (
                        <Grid item xs={12} sm={6} md={3} key={stat.label}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {stat.label}
                                            </Typography>
                                            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                                                {stat.value}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: '16px',
                                                display: 'grid',
                                                placeItems: 'center',
                                                bgcolor: 'rgba(99,102,241,0.1)',
                                                color: 'primary.main',
                                            }}
                                        >
                                            <Icon />
                                        </Box>
                                    </Stack>
                                    {stat.delta !== undefined && (
                                        <Chip
                                            label={`${stat.delta > 0 ? '+' : ''}${stat.delta}% vs last week`}
                                            color={stat.delta >= 0 ? 'success' : 'error'}
                                            size="small"
                                            sx={{ mt: 2 }}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            <Grid container spacing={3} alignItems="stretch">
                {pipeline.map((stage) => (
                    <Grid item xs={12} md={3} key={stage.stage}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {stage.label ?? getPipelineStatusLabel(stage.stage)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {stage.summary}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={stage.count}
                                        color={getPipelineStatusColor(stage.stage)}
                                        size="small"
                                    />
                                </Stack>

                                <Stack spacing={2}>
                                    {stage.jobs.map((job) => (
                                        <Box
                                            key={`${job.company}-${job.role}`}
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                bgcolor: 'rgba(15, 23, 42, 0.55)',
                                                border: '1px solid rgba(148, 163, 184, 0.14)',
                                            }}
                                        >
                                            <Typography fontWeight={600}>{job.role}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {job.company}
                                            </Typography>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                                                <Chip
                                                    size="small"
                                                    label={
                                                        job.status_label
                                                            ?? getPipelineStatusLabel(job.status)
                                                    }
                                                    color={getPipelineStatusColor(job.status)}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {job.applied_at}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} alignItems="stretch">
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                                Recent activity
                            </Typography>
                            <List disablePadding>
                                {activity.map((item, index) => (
                                    <Box key={`${item.title}-${item.timestamp}`}>
                                        <ListItem disablePadding sx={{ py: 1.5 }}>
                                            <ListItemText
                                                primary={
                                                    <Typography fontWeight={600}>
                                                        {item.title}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.description}
                                                    </Typography>
                                                }
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                                {item.timestamp}
                                            </Typography>
                                        </ListItem>
                                        {index < activity.length - 1 && <Divider light />}
                                    </Box>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                                Upcoming follow-ups
                            </Typography>
                            <Stack spacing={2}>
                                {followUps.map((followUp) => (
                                    <Box key={`${followUp.company}-${followUp.role}`}>
                                        <Typography fontWeight={600}>{followUp.role}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {followUp.company}
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={followUp.completion ?? 0}
                                            sx={{ mt: 1.5 }}
                                        />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                            Follow up in {followUp.due_in}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {(statusChartData || applicationsTrendData) && (
                <Grid container spacing={3} alignItems="stretch">
                    {statusChartData && (
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                                        Application status mix
                                    </Typography>
                                    <Box sx={{ height: 280 }}>
                                        <Pie
                                            data={statusChartData}
                                            options={{
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom',
                                                    },
                                                },
                                                maintainAspectRatio: false,
                                            }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                    {applicationsTrendData && (
                        <Grid item xs={12} md={8}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                                        Applications over time
                                    </Typography>
                                    <Box sx={{ height: 280 }}>
                                        <Bar
                                            data={applicationsTrendData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    },
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: {
                                                            precision: 0,
                                                        },
                                                    },
                                                    x: {
                                                        grid: {
                                                            display: false,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            )}

            <Dialog
                open={scrapeDialogOpen}
                onClose={() => {
                    if (!scrapeSubmitting) {
                        setScrapeDialogOpen(false);
                    }
                }}
                fullWidth
                maxWidth="sm"
            >
                <form onSubmit={handleScrapeSubmit}>
                    <DialogTitle>Scrape a company</DialogTitle>
                    <DialogContent dividers>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Enter a company keyword to queue a new scrape job. The latest postings will appear here once
                            the scrape finishes.
                        </Typography>

                        {scrapeErrors?.general && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {scrapeErrors.general}
                            </Alert>
                        )}

                        <TextField
                            autoFocus
                            fullWidth
                            label="Company keyword"
                            name="keyword"
                            value={scrapeKeyword}
                            onChange={(event) => setScrapeKeyword(event.target.value)}
                            required
                            error={Boolean(scrapeErrors?.keyword)}
                            helperText={scrapeErrors?.keyword ?? ' '}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                if (!scrapeSubmitting) {
                                    setScrapeDialogOpen(false);
                                }
                            }}
                            disabled={scrapeSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={scrapeSubmitting || !scrapeKeyword.trim()}
                        >
                            {scrapeSubmitting ? 'Queuing…' : 'Start scrape'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog
                open={manualDialogOpen}
                onClose={() => {
                    if (!manualSubmitting) {
                        setManualDialogOpen(false);
                    }
                }}
                fullWidth
                maxWidth="sm"
            >
                <form onSubmit={handleManualSubmit}>
                    <DialogTitle>Log a manual application</DialogTitle>
                    <DialogContent dividers>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Capture an opportunity you found manually so it stays in sync with your pipeline.
                        </Typography>

                        {manualErrors?.general && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {manualErrors.general}
                            </Alert>
                        )}

                        <Stack spacing={2}>
                            <TextField
                                label="Company"
                                name="company"
                                value={manualForm.company}
                                onChange={handleManualFieldChange}
                                required
                                error={Boolean(manualErrors?.company)}
                                helperText={manualErrors?.company ?? ''}
                            />
                            <TextField
                                label="Role title"
                                name="job_title"
                                value={manualForm.job_title}
                                onChange={handleManualFieldChange}
                                required
                                error={Boolean(manualErrors?.job_title)}
                                helperText={manualErrors?.job_title ?? ''}
                            />
                            <TextField
                                label="Location"
                                name="location"
                                value={manualForm.location}
                                onChange={handleManualFieldChange}
                                error={Boolean(manualErrors?.location)}
                                helperText={manualErrors?.location ?? ''}
                            />
                            <TextField
                                select
                                label="Work mode"
                                name="mode"
                                value={manualForm.mode}
                                onChange={handleManualFieldChange}
                                error={Boolean(manualErrors?.mode)}
                                helperText={manualErrors?.mode ?? ''}
                            >
                                <MenuItem value="">Select…</MenuItem>
                                {WORK_MODE_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Status"
                                name="status"
                                value={manualForm.status}
                                onChange={handleManualFieldChange}
                                error={Boolean(manualErrors?.status)}
                                helperText={manualErrors?.status ?? ''}
                            >
                                {APPLICATION_STATUS_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                label="Job URL"
                                name="job_url"
                                value={manualForm.job_url}
                                onChange={handleManualFieldChange}
                                error={Boolean(manualErrors?.job_url)}
                                helperText={manualErrors?.job_url ?? ''}
                            />
                            <TextField
                                label="Applied on"
                                name="applied_at"
                                type="date"
                                value={manualForm.applied_at}
                                onChange={handleManualFieldChange}
                                InputLabelProps={{ shrink: true }}
                                error={Boolean(manualErrors?.applied_at)}
                                helperText={manualErrors?.applied_at ?? ''}
                            />
                            <TextField
                                label="Notes"
                                name="notes"
                                value={manualForm.notes}
                                onChange={handleManualFieldChange}
                                multiline
                                minRows={3}
                                error={Boolean(manualErrors?.notes)}
                                helperText={manualErrors?.notes ?? ''}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                if (!manualSubmitting) {
                                    setManualDialogOpen(false);
                                }
                            }}
                            disabled={manualSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={manualSubmitting}>
                            {manualSubmitting ? 'Saving…' : 'Save application'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Stack>
    );
}

Dashboard.layout = (page) => <MainLayout title="Dashboard">{page}</MainLayout>;