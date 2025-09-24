import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import WorkHistoryRoundedIcon from '@mui/icons-material/WorkHistoryRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import MainLayout from '../Layouts/MainLayout';

const STAT_ICONS = {
    growth: TrendingUpRoundedIcon,
    interviews: ScheduleRoundedIcon,
    offers: TaskAltRoundedIcon,
    pipeline: WorkHistoryRoundedIcon,
};

const stagePalette = {
    applied: 'primary',
    interviewing: 'secondary',
    offer: 'success',
    rejected: 'error',
};

export default function Dashboard({ stats = [], pipeline = [], activity = [], followUps = [] }) {
    return (
        <Stack spacing={5}>
            <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Stay on top of your job hunt
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Monitor pipeline health, recent activity, and upcoming follow-ups in a single view.
                </Typography>
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
                                        <Typography variant="subtitle1" fontWeight={600} textTransform="capitalize">
                                            {stage.stage}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {stage.summary}
                                        </Typography>
                                    </Box>
                                    <Chip label={stage.count} color={stagePalette[stage.stage] ?? 'default'} size="small" />
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
                                                    label={job.status}
                                                    color={stagePalette[stage.stage] ?? 'primary'}
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
                    <Stack spacing={3} height="100%">
                        <Card>
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
                        <Card sx={{ flex: 1 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                                    Weekly goals
                                </Typography>
                                <Stack spacing={2}>
                                    <GoalProgress label="Applications sent" value={8} target={10} />
                                    <GoalProgress label="Networking outreaches" value={5} target={6} />
                                    <GoalProgress label="Interviews scheduled" value={2} target={3} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Stack>
    );
}

Dashboard.layout = (page) => <MainLayout title="Dashboard">{page}</MainLayout>;

function GoalProgress({ label, value, target }) {
    const progress = Math.min(100, Math.round((value / target) * 100));

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={600}>{label}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {value}/{target}
                </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
        </Box>
    );
}