import Check from '@mui/icons-material/Check';
import PersonAddAlt1 from '@mui/icons-material/PersonAddAlt1';
import { Button, CircularProgress, type ButtonProps } from '@mui/material';
import { useCallback, useState } from 'react';
import { useFollowStatus } from '../../hooks/useFollowStatus';

type FollowButtonProps = {
  targetUserId: string | null | undefined;
  onFollowChange?: (isFollowing: boolean) => void;
  hideIfNotAllowed?: boolean;
  autoFetch?: boolean;
  initialIsFollowing?: boolean;
  followLabel?: string;
  followingLabel?: string;
  unfollowHoverLabel?: string;
} & Omit<ButtonProps, 'onClick'>;

export function FollowButton({
  targetUserId,
  onFollowChange,
  hideIfNotAllowed = true,
  autoFetch = true,
  initialIsFollowing,
  followLabel = 'Seguir',
  followingLabel = 'Siguiendo',
  unfollowHoverLabel = 'Dejar de seguir',
  ...buttonProps
}: FollowButtonProps) {
  const { isFollowing, isLoading, canFollow, toggleFollow, isInitialized } = useFollowStatus(
    targetUserId,
    {
      autoFetch,
      initialIsFollowing,
    }
  );
  const [isHovered, setIsHovered] = useState(false);

  const {
    color: buttonColor,
    disabled: buttonDisabled,
    onMouseEnter: customMouseEnter,
    onMouseLeave: customMouseLeave,
    variant: _ignoredVariant,
    startIcon: _ignoredStartIcon,
    sx,
    ...restButtonProps
  } = buttonProps;
  void _ignoredVariant;
  void _ignoredStartIcon;

  const handleClick = useCallback(async () => {
    if (!canFollow) return;
    await toggleFollow();
    setIsHovered(false);
    onFollowChange?.(!isFollowing);
  }, [canFollow, isFollowing, onFollowChange, toggleFollow]);

  const handleMouseEnter: NonNullable<ButtonProps['onMouseEnter']> = (event) => {
    if (isFollowing) {
      setIsHovered(true);
    }
    customMouseEnter?.(event);
  };

  const handleMouseLeave: NonNullable<ButtonProps['onMouseLeave']> = (event) => {
    if (isFollowing) {
      setIsHovered(false);
    }
    customMouseLeave?.(event);
  };

  if (!canFollow && hideIfNotAllowed) {
    return null;
  }

  const disabled = buttonDisabled || !canFollow || isLoading;
  const startIcon = isLoading ? (
    <CircularProgress size={16} color="inherit" />
  ) : isFollowing ? (
    <Check fontSize="small" />
  ) : (
    <PersonAddAlt1 fontSize="small" />
  );

  const label = isFollowing
    ? isHovered
      ? unfollowHoverLabel
      : followingLabel
    : followLabel;

  const computedSx = (() => {
    const followStyles = isFollowing
      ? {
          borderColor: 'divider',
          bgcolor: 'background.paper',
          fontWeight: 600,
          '&:hover': {
            borderColor: 'error.main',
            bgcolor: 'error.main',
            color: 'common.white',
          },
        }
      : null;

    if (!sx) {
      return followStyles ?? undefined;
    }

    if (!followStyles) {
      return sx;
    }

    if (Array.isArray(sx)) {
      return [...sx, followStyles];
    }

    return [sx, followStyles];
  })();

  return (
    <Button
      variant={isFollowing ? 'outlined' : 'contained'}
      color={isFollowing ? 'inherit' : buttonColor ?? 'primary'}
      onClick={handleClick}
      startIcon={startIcon}
      disabled={disabled}
      aria-pressed={isInitialized ? isFollowing : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={computedSx}
      {...restButtonProps}
    >
      {label}
    </Button>
  );
}
