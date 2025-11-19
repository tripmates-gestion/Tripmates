import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  AvatarGroup,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { CheckCircle, HighlightOff } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { acceptPlanInvitation, declinePlanInvitation, getPlanById } from '../services/plansService';
import { getUserByEmail } from '../services/userService';
import type { CommonUser } from '../types/PrivateUserProfiles';
import type { Plan } from '../types/Plans';
import PublicationCard from '../components/publications/PublicationCard';

export default function PlanInvitation() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [participants, setParticipants] = useState<Record<string, CommonUser>>({});

  const knownUsersById = useMemo<Record<string, CommonUser>>(() => {
    const directory: Record<string, CommonUser> = {};
    if (user) {
      directory[user.id] = {
        id: user.id,
        name: user.name ?? 'Usuario',
        email: user.email,
        avatarURL: (user as CommonUser).avatarURL,
        role: user.role,
        description: user.description,
      };
    }
    return directory;
  }, [user]);

  const fetchPlan = useCallback(async () => {
    if (!planId || !accessToken) {
      setLoading(false);
      setError('Necesitas iniciar sesión para gestionar la invitación.');
      return;
    }

    try {
      const planResponse = await getPlanById(accessToken, planId);
      setPlan({
        ...planResponse,
        collaboratorsIds: planResponse.collaboratorsIds ?? [],
        publications: planResponse.publications ?? [],
        description: planResponse.description ?? '',
      });

      const userIds = [planResponse.ownerId, ...(planResponse.collaboratorsIds ?? [])];
      const fetched = await Promise.all(userIds.map(async (id) => {
        try {
          const profile = await getUserByEmail(id, accessToken);
          return [id, profile as CommonUser] as const;
        } catch (participantError) {
          console.warn('No pudimos cargar el usuario', id, participantError);
          return null;
        }
      }));
      const directory: Record<string, CommonUser> = {};
      fetched.forEach((item) => {
        if (item) {
          directory[item[0]] = item[1];
        }
      });
      setParticipants(directory);

      if (user && (planResponse.ownerId === user.id || planResponse.collaboratorsIds?.includes(user.id))) {
        setStatus('accepted');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos cargar el plan.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, planId, user]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const handleAction = async (action: 'accept' | 'decline') => {
    if (!planId || !accessToken) return;

    try {
      if (action === 'accept') {
        await acceptPlanInvitation(accessToken, planId);
        setStatus('accepted');
        await fetchPlan();
      } else {
        await declinePlanInvitation(accessToken, planId);
        setStatus('declined');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos actualizar la invitación.';
      setError(message);
    }
  };

  const renderUserAvatar = (userId: string, fallback: string) => {
    const userInfo = participants[userId] ?? knownUsersById[userId];
    const label = userInfo?.name ?? fallback;
    return (
      <Tooltip key={userId} title={label}>
        <Avatar
          src={userInfo?.avatarURL}
          alt={label}
          sx={{ width: 40, height: 40, bgcolor: (theme) => theme.palette.primary.main, color: 'white' }}
        >
          {label.charAt(0).toUpperCase()}
        </Avatar>
      </Tooltip>
    );
  };

  const participantName = (userId: string, fallback: string) => participants[userId]?.name ?? knownUsersById[userId]?.name ?? fallback;

  if (loading) {
    return (
      <Container sx={{ py: 6 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">Cargando invitación...</Typography>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 6 }}>
        <Stack spacing={2} alignItems="center">
          <HighlightOff color="error" sx={{ fontSize: 48 }} />
          <Typography color="error" align="center">{error}</Typography>
          <Button variant="contained" onClick={() => navigate('/profile')}>Ir a mi perfil</Button>
        </Stack>
      </Container>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <Container sx={{ py: 4 }}>
      <Card elevation={2} sx={{ maxWidth: 960, mx: 'auto', borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={status === 'accepted' ? 'Aceptado' : status === 'declined' ? 'Rechazado' : 'Pendiente'} color={status === 'accepted' ? 'success' : status === 'declined' ? 'default' : 'warning'} variant="outlined" />
              <Typography variant="overline" color="text.secondary">Invitación a colaborar</Typography>
            </Stack>

            <Typography variant="h4" fontWeight={800}>{plan.name}</Typography>
            {plan.description && (
              <Typography variant="body1" color="text.secondary">{plan.description}</Typography>
            )}

            <Stack direction="row" spacing={2} alignItems="center">
              <Chip label="Creador" size="small" color="primary" variant="outlined" />
              <Stack direction="row" spacing={1} alignItems="center">
                {renderUserAvatar(plan.ownerId, 'Creador')}
                <Typography variant="subtitle2" fontWeight={700}>
                  {participantName(plan.ownerId, 'Creador del plan')}
                </Typography>
              </Stack>
              {plan.collaboratorsIds?.length ? (
                <>
                  <Chip label="Invitados" size="small" color="secondary" variant="outlined" />
                  <AvatarGroup max={8} sx={{ '& .MuiAvatar-root': { width: 36, height: 36 } }}>
                    {plan.collaboratorsIds.map((id) => renderUserAvatar(id, 'Invitado'))}
                  </AvatarGroup>
                  <Typography variant="body2" color="text.secondary">
                    {plan.collaboratorsIds.map((id) => participantName(id, 'Invitado')).join(', ')}
                  </Typography>
                </>
              ) : null}
            </Stack>

            <Divider />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                disabled={status === 'accepted'}
                onClick={() => handleAction('accept')}
              >
                Aceptar invitación
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<HighlightOff />}
                disabled={status === 'declined'}
                onClick={() => handleAction('decline')}
              >
                Rechazar
              </Button>
              <Button
                variant="text"
                onClick={() => navigate('/profile')}
              >
                Ver mis planes
              </Button>
            </Stack>

            {plan.publications?.length > 0 && (
              <>
                <Divider />
                <Typography variant="subtitle1" fontWeight={700}>Publicaciones del plan</Typography>
                <Grid container spacing={2}>
                  {plan.publications.map((publication) => (
                    <Grid item xs={12} sm={6} md={4} key={publication.id}>
                      <PublicationCard publication={publication} onView={() => undefined} />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
