// src/components/restaurant/MenuEditorDialog.tsx
import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { DeleteOutline, Close } from "@mui/icons-material";
import { NewImagesDropzone } from "../../businessPrivateProfile/common/Utils";
import type { MenuItem } from "../../../../types/Restaurant";
import { InputAdornment } from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    data: Omit<MenuItem, "photosURLs">;
    files: File[];
    deletePhotoIndexes?: number[];
  }) => Promise<void>;
  initial?: MenuItem | null;
  title?: string;
};

type Errors = {
  foodName?: string;
  price?: string;
  description?: string;
  images?: string;
};

export default function MenuEditorDialog({
  open,
  onClose,
  onSubmit,
  initial,
  title,
}: Props) {
  const [foodName, setFoodName] = React.useState(initial?.foodName ?? "");
  const [price, setPrice] = React.useState<number>(initial?.price ?? 0);
  const [description, setDescription] = React.useState(
    initial?.description ?? ""
  );
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const [deletePhotoIndexes, setDeletePhotoIndexes] =
    React.useState<number[]>([]);

  React.useEffect(() => {
    setFoodName(initial?.foodName ?? "");
    setPrice(initial?.price ?? 0);
    setDescription(initial?.description ?? "");
    setFiles([]);
    setPreviews([]);
    setErrors({});
    setDeletePhotoIndexes([]);
  }, [initial, open]);

  const readPreviews = (fs: File[]) => {
    const urls = fs.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);
  };

  const handleFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming as any) as File[];
    const selected = arr.filter((f) => f.type.startsWith("image/"));
    if (selected.length === 0) return;
    setFiles((prev) => [...prev, ...selected]);
    readPreviews(selected);
  };

  const removeNewAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleDeleteExisting = (idx: number) => {
    setDeletePhotoIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!foodName.trim()) e.foodName = "El nombre del plato es obligatorio.";
    if (!Number.isFinite(price) || price <= 0) e.price = "Precio inválido.";
    if (!description.trim()) e.description = "La descripción es obligatoria.";

    const existingCount = initial?.photosURLs?.length ?? 0;
    const remaining = existingCount - deletePhotoIndexes.length + files.length;

    if (!initial) {
      if (files.length === 0) e.images = "Subí al menos una imagen.";
    } else {
      if (remaining < 1) e.images = "Debe quedar al menos una imagen.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({
        data: { foodName, price, description },
        files,
        deletePhotoIndexes: deletePhotoIndexes.length
          ? deletePhotoIndexes
          : undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {title ?? (initial ? "Editar plato" : "Nuevo plato")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
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
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            inputProps={{
              min: 0, step: "0.01"
            }}
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

          {/* nuevas imágenes */}
          <NewImagesDropzone
            previews={previews}
            error={errors.images}
            onFilesSelected={handleFiles}
            onRemoveAt={removeNewAt}
          />

          {/* existentes (marcar para borrar en edición) */}
          {!!initial?.photosURLs?.length && (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Fotos actuales
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Podés marcar para borrar. Las nuevas se agregan.
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                  gap: 1,
                }}
              >
                {initial.photosURLs.map((src, i) => {
                  const marked = deletePhotoIndexes.includes(i);
                  return (
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
                        filter: marked
                          ? "grayscale(1) brightness(0.7)"
                          : "none",
                        outline: marked ? "2px solid #ef5350" : "none",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => toggleDeleteExisting(i)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(255,255,255,0.9)",
                          "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                        }}
                      >
                        {marked ? (
                          <Close fontSize="small" />
                        ) : (
                          <DeleteOutline fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>

              {deletePhotoIndexes.length > 0 && (
                <Typography variant="caption" color="error">
                  Se eliminarán {deletePhotoIndexes.length} foto(s) al guardar.
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={submit} disabled={saving} variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
