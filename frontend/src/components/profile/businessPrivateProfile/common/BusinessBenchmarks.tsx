import * as React from 'react';
import { enqueueSnackbar } from 'notistack';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stack,
    LinearProgress,
    Switch,
    Tooltip,
    Avatar,
    Grid,
    Paper,
    Button,
    CircularProgress,
    IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LockIcon from '@mui/icons-material/Lock';
import SaveIcon from '@mui/icons-material/Save';
import { ACHIEVEMENTS_LIST } from '../../../../constants/BusinessAchievementsData';
import { useAuth } from '../../../../hooks/useAuth';
import { getMyBenchmarksAPI, updateMyBenchmarksVisibilityAPI } from '../../../../services/benchmarks';

import { Edit, Close } from '@mui/icons-material';

export default function BusinessBenchmarks() {
    const [achievedIds, setAchievedIds] = React.useState<string[]>([]);
    const [publicVisibility, setPublicVisibility] = React.useState<Set<string>>(new Set());
    const [tempVisibility, setTempVisibility] = React.useState<Set<string>>(new Set());
    const [isEditing, setIsEditing] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const { accessToken } = useAuth();

    if (!accessToken) {
        return null;
    }

    React.useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const data = await getMyBenchmarksAPI(accessToken);
                setAchievedIds(data.map(a => a.id));
                setPublicVisibility(new Set(data.filter(a => a.visible).map(a => a.id)));
            } catch (error) {
                console.error("Failed to fetch achievements", error);
            }
        };

        fetchAchievements();
    }, [accessToken]);

    const handleStartEditing = () => {
        setTempVisibility(new Set(publicVisibility));
        setIsEditing(true);
    };

    const handleCancelEditing = () => {
        setIsEditing(false);
        setTempVisibility(new Set());
    };

    const handleToggleVisibility = (id: string) => {
        setTempVisibility(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSave = async () => {
        if (!accessToken) return;
        setSaving(true);

        const changes: { id: string; visible: boolean }[] = [];
        ACHIEVEMENTS_LIST.forEach(ach => {
            const wasVisible = publicVisibility.has(ach.id);
            const isVisible = tempVisibility.has(ach.id);
            if (wasVisible !== isVisible) {
                changes.push({ id: ach.id, visible: isVisible });
            }
        });

        if (changes.length === 0) {
            setIsEditing(false);
            setSaving(false);
            return;
        }

        try {
            await updateMyBenchmarksVisibilityAPI(accessToken, changes);
            setPublicVisibility(tempVisibility);
            setIsEditing(false);
            enqueueSnackbar('Cambios de visibilidad guardados', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Error al guardar cambios', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const totalAchievements = ACHIEVEMENTS_LIST.length;
    const unlockedCount = achievedIds.length;
    const progress = (unlockedCount / totalAchievements) * 100;

    return (
        <Box sx={{ padding: '0 20px', width: '100%', my: 2, alignSelf: 'center' }}>
            <Accordion elevation={0} variant="outlined" sx={{ borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="achievements-content"
                    id="achievements-header"
                >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', mr: 2 }}>
                        <EmojiEventsIcon color="primary" />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Mis Logros
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{ width: 100, height: 6, borderRadius: 3 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {unlockedCount}/{totalAchievements}
                                </Typography>
                            </Stack>
                        </Box>
                        {!isEditing && (
                            <Tooltip title="Decide la visibilidad de tus logros para destacar lo mejor de tu negocio">
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEditing();
                                    }}
                                    sx={{
                                        color: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'primary.light',
                                            color: 'primary.contrastText',
                                        },
                                    }}
                                    size="small"
                                >
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        {ACHIEVEMENTS_LIST.map((achievement) => {
                            const isUnlocked = achievedIds.includes(achievement.id);
                            // Use tempVisibility in edit mode, otherwise publicVisibility
                            const isVisible = isEditing ? tempVisibility.has(achievement.id) : publicVisibility.has(achievement.id);

                            return (
                                <Grid item xs={12} key={achievement.id}>
                                    <Paper
                                        elevation={0}
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            opacity: isUnlocked ? 1 : 0.5,
                                            bgcolor: isUnlocked ? 'background.paper' : 'action.hover',
                                            borderColor: isUnlocked ? 'divider' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2
                                        }}
                                    >
                                        {/* Badge Icon */}
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 60,
                                                height: 60,
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    bgcolor: isUnlocked ? achievement.color : 'grey.400',
                                                    boxShadow: isUnlocked ? `0 0 10px ${achievement.color}80` : 'none',
                                                    border: `2px solid ${isUnlocked ? '#fff' : 'transparent'}`,
                                                }}
                                            >
                                                {isUnlocked ? achievement.icon : <LockIcon />}
                                            </Avatar>
                                        </Box>

                                        {/* Info */}
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {achievement.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {achievement.description}
                                            </Typography>
                                        </Box>

                                        {/* Toggle Visibility */}
                                        {isUnlocked && (
                                            <Stack alignItems="center" spacing={0.5}>
                                                <Tooltip title={isVisible ? "Visible en perfil público" : "Oculto en perfil público"}>
                                                    <Switch
                                                        size="small"
                                                        checked={isVisible}
                                                        onChange={() => handleToggleVisibility(achievement.id)}
                                                        disabled={!isEditing || saving}
                                                    />
                                                </Tooltip>
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isVisible ? 'success.main' : 'text.disabled' }}>
                                                    {isVisible ? 'Visible' : 'Oculto'}
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {isEditing && (
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleCancelEditing}
                                disabled={saving}
                                startIcon={<Close />}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={saving}
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            >
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </Box>
                    )}
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}
