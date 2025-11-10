import Check from '@mui/icons-material/Check';
import PersonAddAlt1 from '@mui/icons-material/PersonAddAlt1';
import { Button, CircularProgress, type ButtonProps } from '@mui/material';
import { useCallback } from 'react';
import { useFollowStatus } from '../../hooks/useFollowStatus';

type FollowButtonProps = {
  targetUserId: string | null | undefined;
  onFollowChange?: (isFollowing: boolean) => void;
  hideIfNotAllowed?: boolean;
} & Omit<ButtonProps, 'onClick'>;

export function FollowButton({
  targetUserId,
  onFollowChange,
  hideIfNotAllowed = true,
  ...buttonProps
}: FollowButtonProps) {
  const { isFollowing, isLoading, canFollow, toggleFollow, isInitialized } =
    useFollowStatus(targetUserId);

  const handleClick = useCallback(async () => {
    if (!canFollow) return;
    await toggleFollow();
    onFollowChange?.(!isFollowing);
  }, [canFollow, isFollowing, onFollowChange, toggleFollow]);

  if (!canFollow && hideIfNotAllowed) {
    return null;
  }

  const disabled = buttonProps.disabled || !canFollow || isLoading;
  const startIcon = isLoading ? (
    <CircularProgress size={16} color="inherit" />
  ) : isFollowing ? (
    <Check fontSize="small" />
  ) : (
    <PersonAddAlt1 fontSize="small" />
  );

  return (
    <Button
      variant={isFollowing ? 'outlined' : 'contained'}
      color={isFollowing ? 'inherit' : buttonProps.color ?? 'primary'}
      onClick={handleClick}
      startIcon={startIcon}
      disabled={disabled}
      aria-pressed={isInitialized ? isFollowing : undefined}
      {...buttonProps}
    >
      {isFollowing ? 'Siguiendo' : 'Seguir'}
    </Button>
  );
}
