import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { updateMySocialMedia, type SocialMediaLinks } from "../../services/socialMedia";
import { useAuth } from "../../hooks/useAuth";

interface EditSocialMediaDialogProps {
  open: boolean;
  onClose: () => void;
  initialValues: SocialMediaLinks;
  onUpdated?: (values: SocialMediaLinks) => void;
}

const isValidUrl = (value?: string) => {
  if (!value) return true;
  return /^https?:\/\//i.test(value.trim());
};

const BASE_URLS: Record<keyof SocialMediaLinks, string> = {
    instagramURL: "https://instagram.com/",
    xURL: "https://x.com/",
    facebookURL: "https://facebook.com/",
  };
  
  const normalizeValue = (key: keyof SocialMediaLinks, raw?: string) => {
    if (!raw) return "";
  
    const trimmed = raw.trim();
    if (isValidUrl(trimmed)) return trimmed;
  
    const username = trimmed.replace(/^@/, "");
    const base = BASE_URLS[key];
    return base ? `${base}${username}` : username;
  };



export default function EditSocialMediaDialog({
  open,
  onClose,
  initialValues,
  onUpdated,
  
}: EditSocialMediaDialogProps) {
    const [values, setValues] = React.useState<SocialMediaLinks>(initialValues);
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { accessToken } = useAuth();
  
    React.useEffect(() => {
      if (open) {
        setValues(initialValues);
        setError(null);
      }
    }, [initialValues, open]);
  
    const handleChange = (field: keyof SocialMediaLinks) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setValues(prev => ({ ...prev, [field]: nextValue }));
    };
  
    const handleSave = async () => {
      setError(null);
  
      const normalized: SocialMediaLinks = {
        instagramURL: normalizeValue("instagramURL", values.instagramURL),
        xURL: normalizeValue("xURL", values.xURL),
        facebookURL: normalizeValue("facebookURL", values.facebookURL),
    };

    if (!isValidUrl(normalized.instagramURL) || !isValidUrl(normalized.xURL) || !isValidUrl(normalized.facebookURL)) {
        setError("Cada link debe empezar con http:// o https://");
        return;
      }
  
      try {
        setSubmitting(true);
        await updateMySocialMedia(normalized, accessToken);
        onUpdated?.(normalized);
        onClose();
      } catch (e) {
        const message = e instanceof Error ? e.message : "No pudimos guardar los cambios.";
        setError(message);
      } finally {
        setSubmitting(false);
      }
    };
  
    return (
      <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
        <DialogTitle>Redes sociales (opcional)</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Podés dejar los campos vacíos. Si escribís solo tu usuario, completaremos el link automáticamente.
            </Typography>
  
            <TextField
              label="Instagram"
              placeholder="usuario"
              value={values.instagramURL ?? ""}
              onChange={handleChange("instagramURL")}
              fullWidth
              helperText={`Guardaremos tu perfil como ${BASE_URLS.instagramURL}usuario`}
            />
  
            <TextField
              label="X / Twitter"
              placeholder="usuario"
              value={values.xURL ?? ""}
              onChange={handleChange("xURL")}
              fullWidth
              helperText={`Guardaremos tu perfil como ${BASE_URLS.xURL}usuario`}
            />
  
            <TextField
              label="Facebook"
              placeholder="usuario"
              value={values.facebookURL ?? ""}
              onChange={handleChange("facebookURL")}
              fullWidth
              helperText={`Guardaremos tu perfil como ${BASE_URLS.facebookURL}usuario`}
            />
  
            {error && (
              <Box sx={{ color: "error.main", fontSize: 14 }}>
                {error}
              </Box>
            )}
          </Stack>
        </DialogContent>
  
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    );
}
