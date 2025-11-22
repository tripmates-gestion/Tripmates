import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';
import { PROFILE_LIMITS } from '../../../constants/UserProfile';
import CountedTextField from '../../ui/CountedTextField';
import ImageUploader from '../../ui/ImageUploader';
import { type CommonUser } from '../../../types/PrivateUserProfiles';
import { dataURLtoFile } from '../../GeneralHelpers';


type Props = {
  open: boolean;
  onClose: () => void;
  user: CommonUser;
  onSave: (changes: Partial<CommonUser>, avatarFile: File | null) => void;
  saving?: boolean;
};

export default function EditProfileDialog({
  open,
  onClose,
  user,
  onSave,
  saving = false,
}: Props) {
  const [name, setName] = React.useState(user.name);
  const [description, setDescription] = React.useState(user.description ?? '');
  const [avatarPreview, setAvatarPreview] = React.useState<string | undefined>(
    user.avatarURL
  );
  const [avatarDataUrl, setAvatarDataUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setName(user.name);
    setDescription(user.description ?? '');
    setAvatarPreview(user.avatarURL);
    setAvatarDataUrl(null);
  }, [open, user]);

  const handleSave = React.useCallback(() => {
    if (saving) return; // por las dudas

    const changes: Partial<CommonUser> = {
      name,
      description,
    };

    const avatarFile = avatarDataUrl
      ? dataURLtoFile(avatarDataUrl, 'avatar.jpg')
      : null;

    onSave(changes, avatarFile);
  }, [name, description, avatarDataUrl, onSave, saving]);

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar perfil</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <CountedTextField
            label="Nombre"
            value={name}
            onChange={(v) => setName(v)}
            maxLength={PROFILE_LIMITS.name}
            fullWidth
            disabled={saving}
          />

          <CountedTextField
            label="Descripción"
            value={description}
            onChange={(v) => setDescription(v)}
            maxLength={PROFILE_LIMITS.description}
            fullWidth
            multiline
            minRows={3}
            disabled={saving}
          />

          <ImageUploader
            label="Foto de perfil"
            imageUrl={avatarPreview}
            variant="circular"
            onChange={(b64) => {
              const val = b64 || null;
              setAvatarDataUrl(val);
              setAvatarPreview(val || user.avatarURL);
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
