import Close from '@mui/icons-material/Close';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import type { KeyboardEvent, ReactNode } from 'react';
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
  renderAction?: (account: CommonUser) => ReactNode;
  onItemClick?: (account: CommonUser) => void;
};

const TITLES = {
  followers: 'Seguidores',
  followings: 'Siguiendo',
} as const;

const EMPTY_MESSAGES = {
  followers: 'Aún no tienes seguidores.',
  followings: 'Todavía no sigues a nadie.',
} as const;

export function ConnectionsListDialog({
  open,
  onClose,
  type,
  items,
  loading = false,
  error = null,
  onRefresh,
  emptyMessage,
  renderAction,
  onItemClick,
}: ConnectionsListDialogProps) {
  const title = TITLES[type];
  const resolvedEmptyMessage = emptyMessage ?? EMPTY_MESSAGES[type];
  const count = items.length;
  const isInteractive = Boolean(onItemClick);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 4,
        },
      }}
    >
      <DialogTitle
        sx={{
          pr: 6,
          py: 2,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {count === 0
            ? 'Sin conexiones todavía'
            : `${count} ${count === 1 ? 'persona' : 'personas'}`}
        </Typography>

        <IconButton
          aria-label="Cerrar"
          onClick={onClose}
          edge="end"
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary',
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          // aire horizontal
          px: 2,
          py: 0,
          bgcolor: 'background.default',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 5,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Stack spacing={2} alignItems="center" sx={{ py: 5, px: 3 }}>
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
          <Box sx={{ py: 5, px: 3 }}>
            <Typography color="text.secondary" align="center">
              {resolvedEmptyMessage}
            </Typography>
          </Box>
        ) : (
          <List
            sx={{
              py: 0,
              maxHeight: 420,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: 8,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 4,
              },
            }}
          >
            {items.map((account) => {
              const avatarFallback = account.name
                ? account.name[0]?.toUpperCase()
                : '?';

              const handleActivate = () => {
                onItemClick?.(account);
              };

              const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
                if (!onItemClick || event.target !== event.currentTarget) {
                  return;
                }

                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onItemClick(account);
                }
              };

              return (
                <ListItem
                  key={account.id}
                  divider
                  disableGutters
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    transition: 'background-color 0.15s ease-in-out',
                    ...(isInteractive
                      ? {
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          '&:focus-visible': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                            outlineOffset: '-2px',
                          },
                        }
                      : {}),
                  }}
                  onClick={isInteractive ? handleActivate : undefined}
                  role={isInteractive ? 'button' : undefined}
                  tabIndex={isInteractive ? 0 : undefined}
                  onKeyDown={isInteractive ? handleKeyDown : undefined}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={account.avatarURL ?? undefined}
                      alt={account.name ?? undefined}
                      sx={{ width: 44, height: 44 }}
                    >
                      {avatarFallback}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    sx={{ pr: renderAction ? 9 : 1 }}
                    primary={
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        noWrap
                      >
                        {account.name}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                      >
                        {account.description || account.email}
                      </Typography>
                    }
                  />

                  {renderAction && (
                    <ListItemSecondaryAction
                      sx={{
                        // mueve el botón un poco hacia adentro
                        right: 16, // 24px en vez de 16px por defecto
                      }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {renderAction(account)}
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
