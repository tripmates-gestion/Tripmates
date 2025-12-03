import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Stack,
    Avatar,
    Paper,
    useTheme,
    ButtonBase
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getRecentlySeenBusinessAccounts } from '../../../services/history';
import type { SeenBusiness } from '../../../types/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface RecentlySeenBusinessProps {
    userId: string;
    accessToken: string;
}

export default function RecentlySeenBusiness({ accessToken }: RecentlySeenBusinessProps) {
    const [loading, setLoading] = useState(true);
    const [seenBusinesses, setSeenBusinesses] = useState<SeenBusiness[]>([]);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            try {
                const data = await getRecentlySeenBusinessAccounts(accessToken);
                if (mounted) {
                    setSeenBusinesses(data);
                }
            } catch (error) {
                console.error("Error fetching recently seen businesses", error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };
        fetchData();
        return () => { mounted = false; };
    }, [accessToken]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (seenBusinesses.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8, opacity: 0.7 }}>
                <Typography variant="h6" gutterBottom>
                    Aún no has visitado ningún negocio
                </Typography>
                <Typography variant="body2">
                    Explora la app para descubrir lugares increíbles.
                </Typography>
            </Box>
        );
    }

    // Group by date
    const groupedByDate = seenBusinesses.reduce((acc, item) => {
        const dateObj = new Date(item.date);
        const dateKey = dateObj.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
    }, {} as Record<string, SeenBusiness[]>);

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
        const dateA = new Date(groupedByDate[a][0].date).getTime();
        const dateB = new Date(groupedByDate[b][0].date).getTime();
        return dateB - dateA;
    });


    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', py: 2 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
                Diario de mis descubrimientos :)
            </Typography>

            <Stack spacing={4}>
                {sortedDates.map((dateKey) => (
                    <Box key={dateKey}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CalendarTodayIcon color="primary" sx={{ mr: 1.5 }} />
                            <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                {dateKey}
                            </Typography>
                        </Box>

                        <Box sx={{
                            borderLeft: `2px solid ${theme.palette.divider}`,
                            ml: 1.5,
                            pl: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}>
                            {groupedByDate[dateKey].map((item, index) => {
                                const business = item.accountResumeResponseDTO;
                                const time = new Date(item.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <Paper
                                        key={`${business.id}-${index}`}
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 2,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: theme.palette.primary.main,
                                                transform: 'translateX(4px)',
                                                boxShadow: theme.shadows[2]
                                            }
                                        }}
                                    >
                                        <ButtonBase
                                            onClick={() => {
                                                const route =
                                                    business.businessType === "HOTEL"
                                                        ? `/hotel/${business.id}`
                                                        : `/restaurant/${business.id}`;
                                                navigate(route, { state: { account: business } });
                                            }}
                                            sx={{ width: '100%', textAlign: 'left', display: 'block' }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar
                                                    src={business.avatarURL}
                                                    alt={business.name}
                                                    sx={{ width: 56, height: 56 }}
                                                />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {business.name}
                                                    </Typography>
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                        <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            Visto a las {time}
                                                        </Typography>
                                                        {business.location?.address && (
                                                            <>
                                                                <Typography variant="caption" color="text.secondary">•</Typography>
                                                                <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                                                    {business.location.address}
                                                                </Typography>
                                                            </>
                                                        )}
                                                    </Stack>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} noWrap>
                                                        {business.description}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </ButtonBase>
                                    </Paper>
                                );
                            })}
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
}
