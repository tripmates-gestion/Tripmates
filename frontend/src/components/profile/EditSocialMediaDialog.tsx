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

        if (!isValidUrl(values.instagramURL) || !isValidUrl(values.xURL) || !isValidUrl(values.facebookURL)) {
            setError("Cada link debe empezar con http:// o https://");
            return;
        }

        const payload: SocialMediaLinks = {
            instagramURL: values.instagramURL?.trim() || "",
            xURL: values.xURL?.trim() || "",
            facebookURL: values.facebookURL?.trim() || "",
        };

        try {
            setSubmitting(true);
            await updateMySocialMedia(payload, accessToken);
            onUpdated?.(payload);
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
            <DialogTitle>Redes sociales</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    Podés dejar los campos vacíos. Si completás alguno, asegurate de incluir el protocolo (http/https).
                </Typography>

                <TextField
                    label="Instagram"
                    placeholder="https://instagram.com/usuario"
                    value={values.instagramURL ?? ""}
                    onChange={handleChange("instagramURL")}
                    fullWidth
                />

                <TextField
                    label="X / Twitter"
                    placeholder="https://x.com/usuario"
                    value={values.xURL ?? ""}
                    onChange={handleChange("xURL")}
                    fullWidth
                />

                <TextField
                    label="Facebook"
                    placeholder="https://facebook.com/usuario"
                    value={values.facebookURL ?? ""}
                    onChange={handleChange("facebookURL")}
                    fullWidth
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