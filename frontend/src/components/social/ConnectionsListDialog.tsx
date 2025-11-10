import Close from '@mui/icons-material/Close';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import type { CommonUser } from '../../types/PrivateUserProfiles';


type ConnectionsListDialogProps = {
  open: boolean;
  onClose: () => void;
  type: 'followers' | 'followings';
  items: CommonUser[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  emptyMessage?: string;
};

const TITLES = {
  followers: 'Seguidores',
  followings: 'Siguiendo',
} as const;

const EMPTY_MESSAGES = {
  followers: 'Aún no tienes seguidores.',
  followings: 'Todavía no sigues a nadie.',
} as const;

const BUSINESS_LABEL: Record<string, string> = {
  HOTEL: 'Hotel',
  RESTAURANT: 'Restaurante',
};

export function ConnectionsListDialog({
  open,
  onClose,
  type,
  items,
  loading = false,
  error = null,
  onRefresh,
  emptyMessage,
}: ConnectionsListDialogProps) {
  const title = TITLES[type];
  const resolvedEmptyMessage = emptyMessage ?? EMPTY_MESSAGES[type];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pr: 6 }}>
        {title}
        <IconButton
          aria-label="Cerrar"
          onClick={onClose}
          edge="end"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Stack spacing={2} alignItems="center" sx={{ py: 4, px: 3 }}>
            <Typography color="error" align="center">
              {error}
            </Typography>
            {onRefresh && (
              <Button variant="contained" onClick={onRefresh}>
                Reintentar
              </Button>
            )}
          </Stack>
        ) : items.length === 0 ? (
          <Box sx={{ py: 4, px: 3 }}>
            <Typography color="text.secondary" align="center">
              {resolvedEmptyMessage}
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {items.map((account) => {
              const avatarFallback = account.name ? account.name[0]?.toUpperCase() : '?';
              // const showBusinessChip = account.role === 'BUSINESS' && account.businessType;
              return (
                <ListItem key={account.id} divider disableGutters sx={{ px: 2 }}>
                  <ListItemAvatar>
                    <Avatar src={account.avatarURL ?? undefined} alt={account.name ?? undefined}>
                      {avatarFallback}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                          {account.name}
                        </Typography>
                        {/* {showBusinessChip && (
                          <Chip
                            size="small"
                            label={BUSINESS_LABEL[String(account.businessType)] ?? 'Negocio'}
                          />
                        )} */}
                      </Stack>
                    }
                    secondary={account.description || account.email}
                    secondaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary',
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
