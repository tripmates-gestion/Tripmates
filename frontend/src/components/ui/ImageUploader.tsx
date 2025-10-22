// components/ui/ImageUploader.tsx
import { Box, Stack, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

type Props = {
  label: string;
  imageUrl?: string;
  onChange: (base64: string) => void;
  variant?: 'rectangular' | 'circular';
};

export default function ImageUploader({ label, imageUrl, onChange, variant = 'rectangular' }: Props) {
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={700}>{label}</Typography>

      <Box
        sx={{
          width: variant === 'circular' ? 120 : '100%',
          height: variant === 'circular' ? 120 : 160,
          borderRadius: variant === 'circular' ? '50%' : 2,
          border: '2px dashed',
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          cursor: 'pointer',
          bgcolor: 'background.default',
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!imageUrl && (
          <Stack alignItems="center" spacing={0.5}>
            <CloudUploadIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              Arrastrá o hacé click para subir
            </Typography>
          </Stack>
        )}

        <input
          type="file"
          accept="image/*"
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          onDragOver={(e) => e.preventDefault()}
        />
      </Box>
    </Stack>
  );
}
