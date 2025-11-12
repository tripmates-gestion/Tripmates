/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
} from "@mui/material";
import { FollowButton } from "../social/FollowButton"; // ajustá el path según tu estructura

interface Props {
  user: any;
  onClick: () => void;
}

// Tarjeta de resultado de búsqueda de viajeros
const TravelerCard: React.FC<Props> = ({ user, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      display: "flex",
      alignItems: "center",
      borderRadius: 3,
      cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "scale(1.02)",
        boxShadow: 6,
      },
      pl: 4,
      pr: 4,
      py: 2,
    }}
  >
    <Avatar
      src={user.avatarURL}
      alt={user.name}
      sx={{ width: 60, height: 60, mr: 2 }}
    />

    <CardContent sx={{ flex: 1, px: 0 }}>
      <Typography variant="subtitle1" fontWeight="bold">
        {user.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {user.email}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {user.description ? user.description : "Hi! I'm using TripMates"}
      </Typography>
    </CardContent>

    {/* Botón de seguir real (no navega, solo follow/unfollow) */}
    <Box
      sx={{ ml: 2 }}
      onClick={(e) => {
        // Evita que el click en el botón dispare el onClick del Card
        e.stopPropagation();
      }}
    >
      <FollowButton
        targetUserId={user.id}
        sx={{
          borderRadius: 999,
          px: 2.5,
          fontWeight: 600,
          minWidth: 120,
        }}
        // si querés refrescar algo después de seguir:
        // onFollowChange={...}
      />
    </Box>
  </Card>
);

export default TravelerCard;
