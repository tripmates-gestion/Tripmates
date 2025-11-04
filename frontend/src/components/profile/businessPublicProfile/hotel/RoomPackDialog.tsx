// src/components/hotel/RoomPackEditorDialog.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  Typography,
  Autocomplete,
  Chip,
  InputAdornment,
  IconButton
} from "@mui/material";
import { DeleteOutline, Close } from "@mui/icons-material";
import type {
  RoomPack,
  RoomPackPayload,
  HotelService,
} from "../../../../types/Hotel";
import {
  HOTEL_SERVICE_OPTIONS,
  HOTEL_SERVICE_LABEL,
} from "../../businessPrivateProfile/common/types";
import { NewImagesDropzone } from "../../businessPrivateProfile/common/Utils";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    data: RoomPackPayload;
    files: File[];
    deletePhotoIndexes?: number[];
  }) => Promise<void> | void;
  initial?: RoomPack | null;
  title?: string;
};

type Errors = {
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: string;
  price?: string;
  description?: string;
  images?: string;
};

// ---------- helpers de fechas ----------
const isValidISODate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const parseISODate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};
// --------------------------------------

export function RoomPackEditorDialog({
  open,
  onClose,
  onSubmit,
  initial,
  title = "Nuevo paquete de habitación",
}: Props) {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [services, setServices] = useState<HotelService[]>([]);
  const [price, setPrice] = useState<number | string>("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [deletePhotoIndexes, setDeletePhotoIndexes] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!initial) {
      setCheckInDate("");
      setCheckOutDate("");
      setNumberOfGuests(1);
      setServices([]);
      setPrice("");
      setDescription("");
      setFiles([]);
      setPreviews([]);
      setDeletePhotoIndexes([]);
      setErrors({});
      return;
    }

    setCheckInDate(initial.checkInDate?.slice(0, 10) ?? "");
    setCheckOutDate(initial.checkOutDate?.slice(0, 10) ?? "");
    setNumberOfGuests(initial.numberOfGuests);
    setServices((initial.services ?? []) as HotelService[]);
    setPrice(initial.price);
    setDescription(initial.description ?? "");
    setFiles([]);
    setPreviews([]);
    setDeletePhotoIndexes([]);
    setErrors({});
  }, [initial, open]);

  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;
    setFiles((prev) => [...prev, ...incoming]);
    const newUrls = incoming.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newUrls]);
  };

  const handleNewFiles = (fileListOrArray: FileList | File[]) => {
    const incoming = Array.from(fileListOrArray as any) as File[];
    addFiles(incoming);
  };

  const removeNewFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleDeletePhotoIndex = (idx: number) => {
    setDeletePhotoIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // ---------- VALIDACIÓN ----------
  const validate = (): boolean => {
    const e: Errors = {};

    // check-in
    if (!checkInDate) {
      e.checkInDate = "La fecha de check-in es obligatoria.";
    } else if (!isValidISODate(checkInDate)) {
      e.checkInDate = "Formato de fecha inválido (usar YYYY-MM-DD).";
    }

    // check-out
    if (!checkOutDate) {
      e.checkOutDate = "La fecha de check-out es obligatoria.";
    } else if (!isValidISODate(checkOutDate)) {
      e.checkOutDate = "Formato de fecha inválido (usar YYYY-MM-DD).";
    }

    // comparación solo si ambos son válidos
    if (
      checkInDate &&
      checkOutDate &&
      isValidISODate(checkInDate) &&
      isValidISODate(checkOutDate)
    ) {
      const inDate = parseISODate(checkInDate);
      const outDate = parseISODate(checkOutDate);

      if (outDate <= inDate) {
        e.checkOutDate = "El check-out debe ser posterior al check-in.";
      }
    }

    if (!Number.isFinite(numberOfGuests) || numberOfGuests < 1) {
      e.numberOfGuests = "Debe haber al menos un huésped.";
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      e.price = "Precio inválido.";
    }

    if (!description.trim()) {
      e.description = "La descripción es obligatoria.";
    }

    const existingCount = initial?.photosURLs?.length ?? 0;
    const remaining = existingCount - deletePhotoIndexes.length + files.length;

    if (!initial) {
      if (files.length === 0) {
        e.images = "Subí al menos una imagen de la habitación.";
      }
    } else if (remaining < 1) {
      e.images = "Debe quedar al menos una imagen.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };
  // -------------------------------

  const handleSubmit = async () => {
    if (!validate()) return;

    const data: RoomPackPayload = {
      checkInDate,
      checkOutDate,
      numberOfGuests: Number(numberOfGuests),
      services,
      price: Number(price),
      description,
    };

    try {
      setSubmitting(true);
      await onSubmit({
        data,
        files,
        deletePhotoIndexes:
          initial && deletePhotoIndexes.length > 0
            ? deletePhotoIndexes
            : undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const hasInitialPhotos = initial?.photosURLs && initial.photosURLs.length > 0;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} mt={1}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Check-in"
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              error={!!errors.checkInDate}
              helperText={errors.checkInDate}
              required
            />
            <TextField
              label="Check-out"
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              error={!!errors.checkOutDate}
              helperText={errors.checkOutDate}
              required
            />
          </Stack>

          <TextField
            label="Cantidad de huéspedes"
            type="number"
            inputProps={{ min: 1 }}
            value={numberOfGuests}
            onChange={(e) => setNumberOfGuests(Number(e.target.value) || 1)}
            fullWidth
            error={!!errors.numberOfGuests}
            helperText={errors.numberOfGuests}
            required
          />

          <Autocomplete
            multiple
            options={HOTEL_SERVICE_OPTIONS}
            value={services}
            onChange={(_, newValue) => setServices(newValue)}
            getOptionLabel={(option) => HOTEL_SERVICE_LABEL[option]}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={HOTEL_SERVICE_LABEL[option]}
                  {...getTagProps({ index })}
                  sx={{ borderRadius: "999px" }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Servicios"
                placeholder="Seleccioná servicios"
              />
            )}
            fullWidth
          />

          <TextField
            label="Precio por noche"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            inputProps={{ min: 0, step: "0.01" }}
            error={!!errors.price}
            helperText={errors.price}
            required
          />

          <TextField
            label="Descripción"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            error={!!errors.description}
            helperText={errors.description}
            required
          />

          <NewImagesDropzone
            previews={previews}
            error={errors.images}
            onFilesSelected={handleNewFiles}
            onRemoveAt={removeNewFile}
          />

          {hasInitialPhotos && (
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
                {initial!.photosURLs!.map((src, i) => {
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
                        onClick={() => toggleDeletePhotoIndex(i)}
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
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
