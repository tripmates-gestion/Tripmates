import * as React from "react";
import {
  Box, Stack, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Rating, Snackbar, Alert,
  CardMedia, Chip, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, InputAdornment
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import type { Review } from "../../types/Review";
import { saveReview, getReviews } from "../../services/reviewService";
import { useAuth } from "../../hooks/useAuth";
import { mapReviewListDTOToReviews } from "../../services/mappers/reviewsMapper";
import { ACCOUNT_TYPES } from "../../constants/Rol";
import { ReviewGrid } from "./ReviewGrid";
import { getUserFollowers } from "../../services/userService";

// Función para renderizar texto con mentions
export function renderTextWithMentions(
  text: string,
  onMentionClick?: (mention: { name: string }) => void
) {
  // Regex mejorado: captura @nombre o @nombre apellido (hasta 2 palabras después del @)
  // Permite letras, números, guiones y espacios entre palabras
  const mentionRegex = /@([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\-]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\-]+)?)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Agregar texto antes del mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    const mentionName = match[1]; // Sin el @
    const fullMention = match[0]; // Con el @
    
    // Agregar el mention con estilo
    parts.push(
      <Box
        component="span"
        key={match.index}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onMentionClick?.({ name: mentionName });
        }}
        sx={{
          color: '#2196F3',
          fontWeight: 700,
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline'
          }
        }}
      >
        {fullMention}
      </Box>
    );
    
    lastIndex = match.index + match[0].length;
  }

  // Agregar el texto restante
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

type Props = {
  /** Nombre a mostrar como autor (placeholder) */
  currentUserName?: string;
  /** Referencia automática a la publicación reseñada (opcional) */
  publicationId?: string;
  /** Título de la publicación (opcional, solo visual) */
  publicationTitle?: string;
  userId?: string;
  /** Callback para notificar al padre que se creó una reseña */
  onCreate?: (r: Review) => void;
};


export default function NewReviewPlace({
  currentUserName = "Vos",
  publicationId,
  publicationTitle,
  onCreate,
}: Props) {
  const { user, accessToken } = useAuth();

  const [items, setItems] = React.useState<Review[]>([]);
  const [open, setOpen] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [text, setText] = React.useState("");
  const [rating, setRating] = React.useState<number | null>(null);
  const [images, setImages] = React.useState<string[]>([]);
  const [touched, setTouched] = React.useState(false);

  // Estados para autocompletado de menciones
  const [showMentions, setShowMentions] = React.useState(false);
  const [mentionSearch, setMentionSearch] = React.useState("");
  const [cursorPosition, setCursorPosition] = React.useState(0);
  const textFieldRef = React.useRef<HTMLTextAreaElement>(null);

  // Lista de usuarios sugeridos (puedes reemplazar con datos reales de tu API)
  const [suggestedUsers, setSuggestedUsers] = React.useState<string[]>([]);

  React.useEffect(() => {
    getUserFollowers(user.id, accessToken)
      .then(followers => setSuggestedUsers(followers.map(f => f.name)))
      .catch(() => setSuggestedUsers([]));
  }, [user, accessToken]);

  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; sev: "success" | "error" }>({
    open: false,
    msg: "",
    sev: "success",
  });

  const hasTitleError = touched && title.trim().length === 0;
  const hasTextError = touched && text.trim().length === 0;

  const addImage = (b64: string) => {
    if (images.length >= 6) return;
    setImages((xs) => [...xs, b64]);
  };
  const removeImageAt = (i: number) => {
    setImages((xs) => xs.filter((_, idx) => idx !== i));
  };

  // Función para manejar cambios en el texto y detectar @
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    
    setText(newText);
    setCursorPosition(cursorPos);

    // Buscar si hay un @ antes del cursor
    const textBeforeCursor = newText.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Obtener el texto después del @
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Permitir espacios pero cerrar si:
      // - Hay doble espacio (termina la mención)
      // - Hay salto de línea
      // - Es muy largo (más de 30 caracteres)
      const shouldClose = 
        textAfterAt.includes('  ') || // doble espacio
        textAfterAt.includes('\n') || // salto de línea
        textAfterAt.length > 30; // muy largo
      
      if (!shouldClose) {
        setMentionSearch(textAfterAt.trim()); // trim para filtrar sin espacios extra
        setShowMentions(true);
        return;
      }
    }
    
    setShowMentions(false);
    setMentionSearch("");
  };

  // Función para insertar una mención seleccionada
  const insertMention = (username: string) => {
    const textBeforeCursor = text.substring(0, cursorPosition);
    const textAfterCursor = text.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const newText = 
        text.substring(0, lastAtIndex) + 
        '@' + username + ' ' + 
        textAfterCursor;
      
      setText(newText);
      setShowMentions(false);
      setMentionSearch("");
      
      // Enfocar el TextField después de insertar
      setTimeout(() => {
        if (textFieldRef.current) {
          const newCursorPos = lastAtIndex + username.length + 2;
          textFieldRef.current.focus();
          textFieldRef.current.setSelectionRange(newCursorPos, newCursorPos);
          setCursorPosition(newCursorPos);
        }
      }, 0);
    }
  };

  // Filtrar usuarios basados en la búsqueda
  const filteredUsers = suggestedUsers
    .filter(user => user.toLowerCase().startsWith(mentionSearch.toLowerCase()))
    .slice(0, 3); // Máximo 3 sugerencias
  
  const handleOpen = () => {
    setTouched(false);
    setTitle("");
    setText("");
    setRating(null);
    setImages([]);
    setShowMentions(false);
    setMentionSearch("");
    setCursorPosition(0);
    setOpen(true);
  };

  React.useEffect(() => {
    const loadReviews = async () => {
      if (!publicationId || !accessToken) {
        return;
      }

      try {
        const reviewsDTO = await getReviews(publicationId, accessToken);
        const reviews = mapReviewListDTOToReviews(reviewsDTO);
        setItems(reviews || []);
      } catch (error) {
        console.error('Error loading reviews:', error);
        setItems([]);
        setSnack({ open: true, msg: "Error al cargar las reseñas", sev: "error" });
      } 
    };

    loadReviews();
  }, [publicationId, accessToken]);

  const handleCreate = async () => {

    if (!publicationId || !accessToken) {
      return;
    }
    
    setTouched(true);
    if (title.trim().length === 0 || text.trim().length === 0) {
      setSnack({ open: true, msg: "Completá todos los campos obligatorios.", sev: "error" });
      return;
    }
    const r: Review = {
      id: crypto.randomUUID(),
      avatarUrl: user?.avatarURL || "", // Add avatarUrl
      authorId: user?.id || "unknown", // Add authorId
      authorName: currentUserName, // Add authorName
      author: currentUserName,
      title: title.trim(),
      rating: rating ?? undefined,
      text: text.trim(),
      images,
      createdAt: new Date().toISOString(),
      publicationId,
      publicationTitle,
    };
    try {
      console.log(publicationId)
      saveReview(r, accessToken, images);
    } catch (error) {
      setSnack({ open: true, msg: "Error al guardar la reseña. Intentá nuevamente.", sev: "error" });
      return;
    }
    setItems((prev: any[]) => [r, ...prev]);
    onCreate?.(r);
    setOpen(false);
    setSnack({ open: true, msg: "¡Reseña publicada!", sev: "success" });
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* Header + CTA */}
      {(items.length === 0 && user?.role === ACCOUNT_TYPES.user) ? (
        <Box sx={{ py: 2, textAlign: "center" }}>
          <Typography variant="subtitle1" fontWeight={700}>¿Haz estado en este lugar y probado este item?</Typography>
          <Typography variant="body2" color="text.secondary">
            Compartí tu experiencia con tus TripMates!
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleOpen}>
            Escribir reseña
          </Button>
        </Box>
      ) : (
        <Stack spacing={2}>
          {user?.role === ACCOUNT_TYPES.user && (<Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={800}>Reseñas</Typography>
            <Button variant="contained" onClick={handleOpen}>Escribir reseña</Button>
          </Stack>)}

          {/* Lista */}
          <ReviewGrid items={items} />
        </Stack>
      )}

      {/* Dialogo crear */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nueva reseña</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {/* Referencia visual a la publicación */}
            {publicationTitle && (
              <Chip
                label={`Sobre: ${publicationTitle}`}
                size="small"
                variant="outlined"
                sx={{ alignSelf: "flex-start" }}
              />
            )}

            {/* Título */}
            <TextField
              label="Título de la reseña"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched(true)}
              error={hasTitleError}
              helperText={hasTitleError ? "El título es obligatorio" : ""}
              fullWidth
            />

            {/* Rating */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" color="text.secondary">Calificación (opcional)</Typography>
              <Rating value={rating} onChange={(_, val) => setRating(val)} precision={0.5} />
            </Stack>

            {/* Texto con autocompletado */}
            <TextField
              inputRef={textFieldRef}
              label="Tu experiencia (usa @nombre para mencionar a alguien)"
              value={text}
              onChange={handleTextChange}
              error={hasTextError}
              helperText={hasTextError ? "El texto es obligatorio. Tip: Escribe @nombre para mencionar a alguien" : "Tip: Escribe @nombre para mencionar a alguien"}
              multiline
              minRows={4}
              fullWidth
            />
            
            {/* Modal de sugerencias de menciones */}
            <Dialog
              open={showMentions}
              onClose={() => {
                setShowMentions(false);
                setMentionSearch("");
              }}
              maxWidth="xs"
              fullWidth
            >
              <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">Mencionar a alguien</Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setShowMentions(false);
                      setMentionSearch("");
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </DialogTitle>
              <DialogContent>
                {/* Campo de búsqueda con lupita */}
                <TextField
                  fullWidth
                  placeholder="Buscar usuario..."
                  value={mentionSearch}
                  onChange={(e) => setMentionSearch(e.target.value)}
                  autoFocus
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
                {/* Lista de usuarios filtrados */}
                {filteredUsers.length > 0 ? (
                  <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {filteredUsers.map((username) => (
                      <ListItem key={username} disablePadding>
                        <ListItemButton 
                          onClick={() => insertMention(username)}
                          sx={{
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: '#E3F2FD'
                            }
                          }}
                        >
                          <ListItemText 
                            primary={`@${username}`}
                            primaryTypographyProps={{
                              sx: { color: '#2196F3', fontWeight: 600, fontSize: '1.1rem' }
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                    No se encontraron usuarios
                  </Typography>
                )}
              </DialogContent>
            </Dialog>

            {/* Imágenes */}
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">Imágenes (opcional, hasta 6)</Typography>
              <Grid container spacing={1}>
                {images.map((img, i) => (
                  <Grid key={i} item xs={6} sm={4}>
                    <Box sx={{ position: "relative" }}>
                      <CardMedia component="img" image={img} height={120} sx={{ borderRadius: 1 }} />
                      <IconButton
                        size="small"
                        onClick={() => removeImageAt(i)}
                        sx={{
                          position: "absolute", top: 4, right: 4, bgcolor: "rgba(0,0,0,0.45)",
                          color: "#fff", "&:hover": { bgcolor: "rgba(0,0,0,0.6)" }
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
                {images.length < 6 && (
                  <Grid item xs={12}>
                    <UploadInline onPick={addImage} />
                  </Grid>
                )}
              </Grid>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate}>Publicar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── */

function UploadInline({ onPick }: { onPick: (b64: string) => void }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const onClick = () => inputRef.current?.click();
  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await fileToBase64(f);
    onPick(b64);
    e.target.value = "";
  };
  return (
    <Box>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onChange} />
      <Button variant="outlined" onClick={onClick}>Agregar imagen</Button>
    </Box>
  );
}

function fileToBase64(f: File) {
  return new Promise<string>((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(String(reader.result));
    reader.onerror = rej;
    reader.readAsDataURL(f);
  });
}