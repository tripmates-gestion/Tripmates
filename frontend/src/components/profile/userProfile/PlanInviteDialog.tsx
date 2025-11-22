import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import type { CommonUser } from '../../../types/PrivateUserProfiles';
import type { Plan } from '../../../types/Plans';

interface PlanInviteDialogProps {
  open: boolean;
  plan: Plan | null;
  search: string;
  onSearchChange: (value: string) => void;
  candidates: CommonUser[];
  followersLoading: boolean;
  followersError?: string | null;
  invitedUserIds: Set<string>;
  invitingUserId: string | null;
  onClose: () => void;
  onInvite: (userId: string) => void;
  currentUserId: string | null;
}

const LoadingState = ({ label }: { label: string }) => (
  <Stack alignItems="center" sx={{ py: 3 }}>
    <CircularProgress size={28} />
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      {label}
    </Typography>
  </Stack>
);

export function PlanInviteDialog({
  open,
  plan,
  search,
  onSearchChange,
  candidates,
  followersLoading,
  followersError,
  invitedUserIds,
  invitingUserId,
  onClose,
  onInvite,
  currentUserId,
}: PlanInviteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonAddAlt1Icon fontSize="small" /> Invitar a "{plan?.name ?? 'tu plan'}"
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Busca entre tus seguidores para sumar co-creadores a tu plan.
        </Typography>

        <TextField
          fullWidth
          placeholder="Buscar por nombre o email"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">🔎</InputAdornment>,
          }}
        />

        {followersLoading ? (
          <LoadingState label="Cargando seguidores..." />
        ) : followersError ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {followersError}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {candidates.map((follower) => {
              const isOwner = follower.id === plan?.ownerId;
              const alreadyCollaborator = plan?.collaboratorsIds?.includes(follower.id);
              const alreadyInvited = invitedUserIds.has(follower.id);

              return (
                <Paper
                  key={follower.id}
                  variant="outlined"
                  sx={{
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar src={follower.avatarURL} alt={follower.name} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={600}>{follower.name}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {follower.email}
                      </Typography>
                    </Box>

                    {isOwner && <Chip label="Creador" color="primary" size="small" variant="outlined" />}

                    {alreadyCollaborator && !isOwner && (
                      <Chip label="Ya participa" color="success" size="small" variant="outlined" />
                    )}

                    {alreadyInvited && !alreadyCollaborator && (
                      <Chip label="Invitación enviada" color="info" size="small" variant="outlined" />
                    )}

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PersonAddAlt1Icon />}
                      disabled={
                        isOwner ||
                        alreadyCollaborator ||
                        alreadyInvited ||
                        invitingUserId === follower.id ||
                        !currentUserId
                      }
                      onClick={() => onInvite(follower.id)}
                    >
                      {alreadyInvited ? 'Invitado' : 'Invitar'}
                    </Button>
                  </Stack>
                </Paper>
              );
            })}

            {!followersLoading && candidates.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No encontramos seguidores que coincidan con tu búsqueda.
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}