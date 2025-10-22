import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Typography,
  Box,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';


export type UserStats = { aportes: number; seguidores: number; siguiendo: number };

export type UserProfile = {
  name: string;
  username: string;
  avatarUrl?: string;
  coverUrl?: string;
  description?: string;
  stats: UserStats;
};

type Props = {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updated: UserProfile) => void;
};

// Componente genérico para subir imagen (reutilizable)
function ImageUploader({
  label,
  imageUrl,
  onChange,
  variant = 'rectangular',
}: {
  label: string;
  imageUrl?: string;
  onChange: (base64: string) => void;
  variant?: 'rectangular' | 'circular';
}) {
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={700}>
        {label}
      </Typography>

      <Box
        sx={{
          width: variant === 'circular' ? 120 : '100%',
          height: variant === 'circular' ? 120 : 160,
          borderRadius: variant === 'circular' ? '50%' : 2,
          border: '2px dashed grey',
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          cursor: 'pointer',
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!imageUrl && (
          <Stack alignItems="center">
            <CloudUploadIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              Arrastra una imagen aquí o haz click
            </Typography>
          </Stack>
        )}

        <input
          type="file"
          accept="image/*"
          style={{ position: 'absolute', inset: 0, opacity: 0 }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onDragOver={(e) => e.preventDefault()}
        />
      </Box>
    </Stack>
  );
}

export default function EditProfileDialog({ open, onClose, user, onSave }: Props) {
  const [form, setForm] = React.useState(user);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => setForm(user), [user]);

  const handleChange = (field: keyof UserProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [field]: e.target.value });

  const handleSave = () => {
    if (form.username && form.username.length > 50) {
      setError('El nombre de usuario debe tener como máximo 50 caracteres.');
      return;
    }
    if (form.description && form.description.length > 300) {
      setError('La descripción debe tener como máximo 300 caracteres.');
      return;
    }
    setError(null);
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar perfil</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {error}
            </Alert>
          )}

          {/* Nombre y username */}
          { /*
          <TextField
            label="Nombre"
            value={form.name}
            onChange={handleChange('name')}
            fullWidth
          /> */}
          <TextField
            label="Nombre de usuario"
            value={form.username}
            onChange={handleChange('username')}
            fullWidth
          />

          {/* Descripción */}
          <TextField
            label="Descripción"
            value={(form as any).description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            multiline
            minRows={3}
          />

          {/* Imagen de perfil */}
          <ImageUploader
            label="Foto de perfil"
            imageUrl={form.avatarUrl}
            variant="circular"
            onChange={(img) => setForm({ ...form, avatarUrl: img })}
          />

          {/* Portada */}
          <ImageUploader
            label="Foto de portada"
            imageUrl={form.coverUrl}
            variant="rectangular"
            onChange={(img) => setForm({ ...form, coverUrl: img })}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          Guardar cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}