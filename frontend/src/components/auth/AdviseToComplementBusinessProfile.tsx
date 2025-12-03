import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PAGES_ROUTE } from "../../constants/Pages";

interface AdviseToComplementProfileProps {
  open: boolean;
  onClose: () => void;
}

export default function AdviseToComplementProfile({
  open,
  onClose,
}: AdviseToComplementProfileProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      // 👇 Agregamos el efecto de "iluminación naranja" aquí
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 0 30px 8px rgba(255, 140, 0, 0.4)", // luz difusa anaranjada
          backdropFilter: "blur(4px)",
          transition: "box-shadow 0.3s ease-in-out",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          textAlign: "center",
          color: "primary.main",
        }}
      >
        ¡Cuenta creada con éxito!
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body1" textAlign="center">
            Ahora que creaste tu cuenta de negocio, recuerda complementar la
            información que deseas mostrar en tu perfil.
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
          >
            Puedes agregar fotos, descripción, horarios de atención y más desde
            el icono de perfil (arriba a la izquierda).
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          variant="contained"
          component={RouterLink}
          to={PAGES_ROUTE.profile}
          onClick={onClose}
        >
          Ir a mi perfil
        </Button>
        <Button onClick={onClose} variant="text">
          Más tarde
        </Button>
      </DialogActions>
    </Dialog>
  );
}
