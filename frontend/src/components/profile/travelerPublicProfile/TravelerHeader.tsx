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
}

const TravelerHeader: React.FC<Props> = ({ account, reviewsCount }) => {
  const theme = useTheme();
  // TODO: Debe ser reemplazado por los valores reales obtenidos del backenc
  const followers = 10; // placeholder
  const following = 10; // placeholder

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mb: 6,
        textAlign: "center",
      }}
    >
      <Avatar
        src={account.avatarURL || "/default-avatar.png"}
        alt={account.name}
        sx={{
          width: 120,
          height: 120,
          mb: 2,
          border: `4px solid ${theme.palette.primary.main}`,
        }}
      />
      <Typography variant="h4" fontWeight={600}>
        {account.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
        {account.description || "Este viajero aún no añadió una descripción."}
      </Typography>

      <Stack
        direction="row"
        spacing={4}
        divider={<Divider orientation="vertical" flexItem />}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {followers}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Seguidores
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {following}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Siguiendo
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {reviewsCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reviews
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default TravelerHeader;
