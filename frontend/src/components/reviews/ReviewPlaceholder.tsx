import { Box, Typography } from "@mui/material"

export default function ReviewPlaceholder() {
  return (
    <Box sx={{ py: 2, textAlign: "center" }}>
      <Typography variant="subtitle1" fontWeight={700}>
        Próximamente reseñas
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Aquí los usuarios podrán dejar comentarios y valoraciones.
      </Typography>
    </Box>
  )
}