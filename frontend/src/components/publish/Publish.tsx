import React from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  ImageList,
  ImageListItem,
  Stack,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  LinearProgress,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import CloseIcon from "@mui/icons-material/Close";
import { ACCOUNT_TYPES } from '../../constants/Rol'



// ==== Tipos ====
export type Role = typeof ACCOUNT_TYPES[keyof typeof ACCOUNT_TYPES]

export type MediaKind = "image" | "video";

export type MediaItem = {
  id: string;
  kind: MediaKind;
  name: string;
  size: number;
  url: string;
};

export type BusinessPost = {
  id: string;
  title?: string;
  description: string;
  media: MediaItem[];
  createdAt: string;
};

// ==== Mock API ====
const mockLatency = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function mockPublishPost(input: Omit<BusinessPost, "id" | "createdAt">): Promise<BusinessPost> {
  await mockLatency(700);
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
}

// ==== Hook de estado local para publicaciones ====
export function useBusinessPosts(initial: BusinessPost[] = []) {
  const [posts, setPosts] = React.useState<BusinessPost[]>(initial);
  const addPost = React.useCallback((p: BusinessPost) => setPosts((prev) => [p, ...prev]), []);
  return { posts, addPost };
}

// ==== Uploader de media ====
const ACCEPT_IMAGES = "image/*";
const ACCEPT_VIDEOS = "video/*";
const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 30;
const MAX_TOTAL_FILES = 10;

function fileToMediaItem(file: File): Promise<MediaItem> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const kind: MediaKind = file.type.startsWith("video/") ? "video" : "image";
    resolve({ id: crypto.randomUUID(), kind, name: file.name, size: file.size, url });
  });
}

export function MediaUploader({ value, onChange }: { value: MediaItem[]; onChange: (v: MediaItem[]) => void; }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const handlePick = () => inputRef.current?.click();

  const validate = (files: FileList) => {
    if (files.length + value.length > MAX_TOTAL_FILES) return `Máximo ${MAX_TOTAL_FILES} archivos`;
    for (const f of Array.from(files)) {
      if (!(f.type.startsWith("image/") || f.type.startsWith("video/"))) return `Formato no permitido: ${f.type}`;
      const sizeMB = f.size / (1024 * 1024);
      if (f.type.startsWith("image/") && sizeMB > MAX_IMAGE_MB) return `Imagen supera ${MAX_IMAGE_MB}MB: ${f.name}`;
      if (f.type.startsWith("video/") && sizeMB > MAX_VIDEO_MB) return `Video supera ${MAX_VIDEO_MB}MB: ${f.name}`;
    }
    return null;
  };

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const v = validate(files);
    if (v) {
      setError(v);
      e.target.value = "";
      return;
    }
    setUploading(true);
    const items = await Promise.all(Array.from(files).map(fileToMediaItem));
    onChange([...items, ...value]);
    setUploading(false);
    e.target.value = "";
  };

  const remove = (id: string) => onChange(value.filter((m) => m.id !== id));

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button variant="outlined" startIcon={<AddPhotoAlternateIcon />} onClick={handlePick}>
          Agregar fotos
        </Button>
        <Button variant="outlined" startIcon={<VideoLibraryIcon />} onClick={handlePick}>
          Agregar videos
        </Button>
        <Typography variant="caption" sx={{ ml: 1 }}>
          JPG/PNG hasta {MAX_IMAGE_MB}MB • MP4 hasta {MAX_VIDEO_MB}MB
        </Typography>
      </Stack>

      <input
        ref={inputRef}
        type="file"
        accept={`${ACCEPT_IMAGES},${ACCEPT_VIDEOS}`}
        multiple
        hidden
        onChange={onFiles}
      />

      {uploading && <LinearProgress />}

      {value.length > 0 && (
        <ImageList cols={4} gap={8} sx={{ m: 0 }}>
          {value.map((m) => (
            <ImageListItem key={m.id}>
              {m.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.name} loading="lazy" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />
              ) : (
                <video src={m.url} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />
              )}
              <Chip
                label={m.kind === "image" ? "Foto" : "Video"}
                size="small"
                sx={{ position: "absolute", top: 6, left: 6, bgcolor: "background.paper" }}
              />
              <IconButton
                size="small"
                onClick={() => remove(m.id)}
                sx={{ position: "absolute", top: 6, right: 6, bgcolor: "background.paper" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </ImageListItem>
          ))}
        </ImageList>
      )}

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="warning" variant="filled">{error}</Alert>
      </Snackbar>
    </Stack>
  );
}

// ==== Formulario de publicación ====
export type PostFormValues = {
  title?: string;
  description: string;
  media: MediaItem[];
};

export function PostFormDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (p: BusinessPost) => void; }) {
  const [values, setValues] = React.useState<PostFormValues>({ title: "", description: "", media: [] });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canSubmit = values.description.trim().length > 0 && !submitting;

  const handlePublish = async () => {
    if (!canSubmit) {
      setError("Faltan campos obligatorios: descripción");
      return;
    }
    setSubmitting(true);
    try {
      const created = await mockPublishPost({ description: values.description.trim(), title: values.title?.trim() || undefined, media: values.media });
      onSuccess(created);
      setValues({ title: "", description: "", media: [] });
      onClose();
    } catch (e) {
      setError("No se pudo publicar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nueva publicación</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          <TextField
            label="Título (opcional)"
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            inputProps={{ maxLength: 120 }}
            fullWidth
          />
          <TextField
            label="Descripción / Detalles"
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            required
            multiline
            minRows={4}
            fullWidth
            helperText="Campo obligatorio"
            error={values.description.trim().length === 0 && !!values.description}
          />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Fotos y videos</Typography>
            <MediaUploader value={values.media} onChange={(media) => setValues((v) => ({ ...v, media }))} />
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancelar</Button>
        <Button variant="contained" onClick={handlePublish} disabled={!canSubmit}>
          {submitting ? "Publicando..." : "Publicar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==== Lista de publicaciones del negocio ====
export function BusinessPostsList({ items }: { items: BusinessPost[] }) {
  if (items.length === 0) return <Alert severity="info">Todavía no hay publicaciones.</Alert>;
  return (
    <Stack spacing={2}>
      {items.map((p) => (
        <Card key={p.id} variant="outlined">
          <CardHeader
            avatar={<Avatar>{p.title?.[0]?.toUpperCase() || "P"}</Avatar>}
            title={p.title || "Publicación"}
            subheader={new Date(p.createdAt).toLocaleString()}
          />
          <CardContent>
            <Typography sx={{ mb: 1.5 }}>{p.description}</Typography>
            {p.media.length > 0 && (
              <ImageList cols={3} gap={8} sx={{ m: 0 }}>
                {p.media.map((m) => (
                  <ImageListItem key={m.id}>
                    {m.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt={m.name} loading="lazy" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />
                    ) : (
                      <video src={m.url} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />
                    )}
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

// ==== Botón de acción condicional por rol ====
export function PublishActionButton({ role, onClick }: { role: String; onClick: () => void }) {
  if (role == "USER") return null;
  return (
    <Button variant="contained" onClick={onClick} sx={{ borderRadius: 2 }}>
      Publicar servicio / alojamiento
    </Button>
  );
}

// ==== Componente demo listo para integrar ====
export default function BusinessPublishingDemo({ role = "BUSINESS" as Role }: { role?: Role }) {
  const { posts, addPost } = useBusinessPosts([
    {
      id: crypto.randomUUID(),
      title: "City Tour Histórico",
      description: "Recorrido guiado por el casco histórico, 2 horas, con snacks incluidos.",
      media: [],
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
    },
  ]);

  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  const handleSuccess = (p: BusinessPost) => {
    addPost(p);
    setToast("¡Publicación creada!");
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" fontWeight={800}>Panel de negocio — Publicaciones</Typography>
        <PublishActionButton role={role} onClick={() => setOpen(true)} />
      </Stack>
      <Divider />
      <BusinessPostsList items={posts} />

      <PostFormDialog open={open} onClose={() => setOpen(false)} onSuccess={handleSuccess} />

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)}>
        <Alert severity="success" variant="filled">{toast}</Alert>
      </Snackbar>
    </Stack>
  );
}
