/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Avatar,
  Box,
  Typography,
  Stack,
  Divider,
  useTheme,
} from "@mui/material";

interface Props {
  account: any;
  reviewsCount: number;
  followerCount: number;
  followingCount: number;
  followersLoading?: boolean;
  followingsLoading?: boolean;
  onFollowersClick?: () => void;
  onFollowingsClick?: () => void;
  followButton?: React.ReactNode;
}

const TravelerHeader: React.FC<Props> = ({
  account,
  reviewsCount,
  followerCount,
  followingCount,
  followersLoading = false,
  followingsLoading = false,
  onFollowersClick,
  onFollowingsClick,
  followButton,
}) => {
  const theme = useTheme();

  const stats: Array<{
    label: string;
    value: React.ReactNode;
    onClick?: () => void;
  }> = [
    {
      label: "Seguidores",
      value: followersLoading ? "..." : followerCount,
      onClick: onFollowersClick,
    },
    {
      label: "Siguiendo",
      value: followingsLoading ? "..." : followingCount,
      onClick: onFollowingsClick,
    },
    {
      label: "Reviews",
      value: reviewsCount,
    },
  ];

  const getInteractiveProps = (onClick?: () => void) => {
    if (!onClick) return {};

    return {
      role: "button" as const,
      tabIndex: 0,
      onClick,
      onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      },
    };
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 960,
        mb: 4,
      }}
    >
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          border: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "center", sm: "flex-start" },
          gap: { xs: 2.5, sm: 3.5 },
        }}
      >
        {/* Avatar + follow button */}
        <Stack
          spacing={2}
          alignItems="center"
          sx={{ minWidth: 180 }}
        >
          <Avatar
            src={account.avatarURL || "/default-avatar.png"}
            alt={account.name}
            sx={{
              width: 112,
              height: 112,
              border: `3px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[3],
            }}
          />
          {followButton && (
            <Box sx={{ mt: 0.5 }}>{followButton}</Box>
          )}
        </Stack>

        {/* Info + stats */}
        <Stack
          spacing={2}
          sx={{
            textAlign: { xs: "center", sm: "left" },
            flex: 1,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={600}>
              {account.name}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {account.description ||
                "Este viajero aún no añadió una descripción."}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={3}
            divider={<Divider orientation="vertical" flexItem />}
            justifyContent={{ xs: "center", sm: "flex-start" }}
            sx={{ mt: 1 }}
          >
            {stats.map(({ label, value, onClick }) => {
              const interactiveProps = getInteractiveProps(onClick);

              return (
                <Box
                  key={label}
                  sx={{
                    textAlign: "center",
                    minWidth: 96,
                    cursor: onClick ? "pointer" : "default",
                    outline: "none",
                    "&:hover .statValue": {
                      color: onClick
                        ? theme.palette.primary.main
                        : undefined,
                    },
                    "&:hover .statLabel": {
                      color: onClick
                        ? theme.palette.primary.main
                        : undefined,
                    },
                  }}
                  {...interactiveProps}
                >
                  <Typography
                    className="statValue"
                    variant="h6"
                    fontWeight={600}
                  >
                    {value}
                  </Typography>
                  <Typography
                    className="statLabel"
                    variant="body2"
                    color="text.secondary"
                  >
                    {label}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default TravelerHeader;
