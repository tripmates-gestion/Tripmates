/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Card, CardContent, Avatar, Typography, Button } from "@mui/material";

interface Props {
  user: any;
  onClick: () => void;
}
// TODO: No se está mostrando correctamente la información que el backend retorna
const TravelerCard: React.FC<Props> = ({ user, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      display: "flex",
      alignItems: "center",
      // p: 2,
      borderRadius: 3,
      cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "scale(1.02)",
        boxShadow: 6,
      },
      paddingLeft: 4,
      paddingRight: 4,
      paddingTop: 2,
      paddingBottom: 2,
    }}
  >
    <Avatar src={user.avatarURL} alt={user.name} sx={{ width: 60, height: 60, mr: 2 }} />
    <CardContent sx={{ flex: 1}}>
      <Typography variant="subtitle1" fontWeight="bold">
        {user.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {user.email}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {user.description?user.description:"Hi! Im using TripMates"}
      </Typography>
    </CardContent>

    {/* TODO: Hacer que se pueda seguir desde aquí */}
    <Button variant="outlined" size="small">
      Seguir
    </Button>
  </Card>
);

export default TravelerCard;
