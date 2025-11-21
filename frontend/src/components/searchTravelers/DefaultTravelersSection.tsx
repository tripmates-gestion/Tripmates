import React from 'react';
import { Box, Typography } from '@mui/material';
import TravelerCard from './TravelerCard';

interface DefaultTravelersSectionProps {
  loadingDefault: boolean;
  defaultUsers: any[];
  bgColor: string;
  handleUserClick: (user: any) => void;
}

const DefaultTravelersSection: React.FC<DefaultTravelersSectionProps> = ({
  loadingDefault,
  defaultUsers,
  bgColor,
  handleUserClick
}) => {
  if (loadingDefault) {
    return (
      <Box sx={{ 
        width: "100%", 
        maxWidth: 600, 
        mt: 4, 
        p: 3, 
        bgcolor: bgColor, 
        borderRadius: 4,
        textAlign: "center"
      }}>
        <Typography variant="body2" color="text.secondary">
          Cargando viajeros sugeridos...
        </Typography>
      </Box>
    );
  }

  if (defaultUsers.length === 0) return null;

  return (
    <Box sx={{ 
      width: "90%", 
      maxWidth: 900, 
      mt: 4, 
      p: 3, 
      bgcolor: bgColor, 
      borderRadius: 4 
    }}>
      <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
        Viajeros sugeridos
      </Typography>
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: 2 
      }}>
        {defaultUsers.map((user) => (
          <TravelerCard
            key={user.id}
            user={user}
            onClick={() => handleUserClick(user)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default DefaultTravelersSection;