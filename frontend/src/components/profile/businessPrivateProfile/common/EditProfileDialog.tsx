import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';
import { PROFILE_LIMITS } from '../../../../constants/UserProfile'
import CountedTextField from '../../../ui/CountedTextField'
import ImageUploader  from '../../../ui/ImageUploader'
 

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


export default function EditProfileDialog({ open, onClose, user, onSave }: Props) {
  const [form, setForm] = React.useState<UserProfile>(user);

  React.useEffect(() => {
    if (open) setForm(user);
  }, [open, user]);

  const handleSave = React.useCallback(() => {
    onSave(form);
    onClose();
  }, [form, onClose, onSave]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar perfil</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <CountedTextField
            label="Nombre de usuario"
            value={form.username ?? ''}
            onChange={(v) => setForm({ ...form, username: v })}
            maxLength={PROFILE_LIMITS.name}
            fullWidth
          />
          <CountedTextField
            label="Descripción"
            value={form.description ?? ''}
            onChange={(v) => setForm({ ...form, description: v })}
            maxLength={PROFILE_LIMITS.description}
            fullWidth
            multiline
            minRows={3}
          />
          <ImageUploader
            label="Foto de perfil"
            imageUrl={form.avatarUrl}
            variant="circular"
            onChange={(img) => setForm({ ...form, avatarUrl: img })}
          />
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
