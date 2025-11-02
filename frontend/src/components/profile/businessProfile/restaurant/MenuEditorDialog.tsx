// src/components/restaurant/MenuEditorDialog.tsx
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Typography, Box, Chip, IconButton
} from "@mui/material";
import { DeleteOutline, CloudUpload } from "@mui/icons-material";
import type { MenuItem } from "../../../../types/Restaurant";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { data: Omit<MenuItem, "photosURLs">; files: File[] }) => Promise<void>;
  initial?: MenuItem | null;
  title?: string;
};

type Errors = {
  foodName?: string;
  price?: string;
  description?: string;
  images?: string;
};

export default function MenuEditorDialog({ open, onClose, onSubmit, initial, title }: Props) {
  const [foodName, setFoodName] = React.useState(initial?.foodName ?? "");
  const [price, setPrice] = React.useState<number>(initial?.price ?? 0);
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});

  React.useEffect(() => {
    setFoodName(initial?.foodName ?? "");
    setPrice(initial?.price ?? 0);
    setDescription(initial?.description ?? "");
    setFiles([]);
    setPreviews([]);
    setErrors({});
  }, [initial, open]);

  const readPreviews = (fs: File[]) => {
    const urls = fs.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);
  };

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const selected = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    if (selected.length === 0) return;
    setFiles((prev) => [...prev, ...selected]);
    readPreviews(selected);
  };

  const removeImageAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!foodName.trim()) e.foodName = "El nombre del plato es obligatorio.";
    if (!Number.isFinite(price) || price <= 0) e.price = "Precio inválido.";
    if (!description.trim()) e.description = "La descripción es obligatoria.";
    // Requerir al menos 1 imagen SOLO si estamos creando (en edición el back hace append)
    const isCreate = !initial;
    if (isCreate && files.length === 0) e.images = "Subí al menos una imagen.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({ data: { foodName, price, description }, files });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title ?? (initial ? "Editar plato" : "Nuevo plato")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Campos */}
          <TextField
            label="Nombre del plato"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            fullWidth
            required
            error={!!errors.foodName}
            helperText={errors.foodName}
          />
          <TextField
            label="Precio"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            fullWidth
            required
            inputProps={{ min: 0, step: "0.01" }}
            error={!!errors.price}
            helperText={errors.price}
          />
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            required
            error={!!errors.description}
            helperText={errors.description}
          />

          {/* Uploader múltiple con estilo de tu ImageUploader */}
          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={700}>Imágenes</Typography>

            {/* Zona drop / click */}
            <Box
              sx={(t) => ({
                width: "100%",
                minHeight: 140,
                borderRadius: 2,
                border: "2px dashed",
                borderColor: "divider",
                display: "grid",
                placeItems: "center",
                position: "relative",
                bgcolor: t.palette.background.default,
                cursor: "pointer",
              })}
            >
              <Stack alignItems="center" spacing={0.5} sx={{ pointerEvents: "none" }}>
                <CloudUpload color="action" />
                <Typography variant="body2" color="text.secondary">
                  Arrastrá o hacé click para subir (podés elegir varias)
                </Typography>
              </Stack>

              <input
                type="file"
                accept="image/*"
                multiple
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                onChange={(e) => handleFiles(e.target.files)}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFiles(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
              />
            </Box>

            {/* Error de imágenes */}
            {!!errors.images && (
              <Typography variant="caption" color="error">
                {errors.images}
              </Typography>
            )}

            {/* Previews nuevas */}
            {previews.length > 0 && (
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Vista previa ({previews.length})
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                    gap: 1,
                  }}
                >
                  {previews.map((src, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: "relative",
                        borderRadius: 1,
                        overflow: "hidden",
                        boxShadow: 1,
                        height: 90,
                        backgroundImage: `url(${src})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => removeImageAt(i)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(255,255,255,0.9)",
                          "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                        }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Stack>
            )}

            {/* En edición: mostrar fotos actuales (informativo) */}
            {!!initial?.photosURLs?.length && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Fotos actuales (se mantendrán; las nuevas se agregan)
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                    gap: 1,
                  }}
                >
                  {initial.photosURLs.map((src, i) => (
                    <Box
                      key={i}
                      sx={{
                        borderRadius: 1,
                        overflow: "hidden",
                        boxShadow: 1,
                        height: 90,
                        backgroundImage: `url(${src})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ))}
                </Box>
              </Stack>
            )}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={submit} disabled={saving} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
