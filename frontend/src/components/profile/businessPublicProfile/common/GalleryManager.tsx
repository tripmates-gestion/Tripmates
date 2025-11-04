import * as React from 'react';
import { Stack, Typography, Grid, Card, CardMedia, IconButton, Tooltip, Box } from '@mui/material';
import { Delete } from '@mui/icons-material';
import ImageUploader from '../../../ui/ImageUploader';
import { MAX_GALLERY_IMAGES } from './types';

export default function GalleryManager({
  existing, toDelete, setToDelete, newOnes, setNewOnes, disabled,
}: {
  existing: string[];               // urls existentes
  toDelete: string[];               // urls marcadas para borrar
  setToDelete: (v: string[]) => void;
  newOnes: string[];                // base64 nuevas
  setNewOnes: (v: string[]) => void;
  disabled?: boolean;
}) {
  const effectiveExisting = React.useMemo(
    () => existing.filter(u => !toDelete.includes(u)),
    [existing, toDelete]
  );

  const total = effectiveExisting.length + newOnes.length;
  const canAddMore = total < MAX_GALLERY_IMAGES;

  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between">
        <Typography variant="subtitle2" fontWeight={700}>Fotos (galería)</Typography>
        <Typography variant="caption" color={total>MAX_GALLERY_IMAGES ? 'error' : 'text.secondary'}>
          {total}/{MAX_GALLERY_IMAGES}
        </Typography>
      </Stack>

      {effectiveExisting.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 0.5 }}>
          {effectiveExisting.map((url) => (
            <Grid item xs={6} key={url}>
              <Card variant="outlined" sx={{ position: 'relative' }}>
                <CardMedia component="img" image={url} height={120} sx={{ objectFit: 'cover' }} />
                <Tooltip title="Quitar foto existente">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => setToDelete([...toDelete, url])}
                      disabled={disabled}
                      sx={{ position:'absolute', top:6, right:6, bgcolor:'rgba(0,0,0,0.45)', color:'common.white',
                        '&:hover':{ bgcolor:'rgba(0,0,0,0.65)'} }}
                    >
                      <Delete fontSize="small"/>
                    </IconButton>
                  </span>
                </Tooltip>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {canAddMore ? (
        <ImageUploader label="Agregar foto a la galería" onChange={(b64)=> setNewOnes([...newOnes, b64])} variant="rectangular" />
      ) : (
        <Typography variant="caption" color="text.secondary">Alcanzaste el máximo de {MAX_GALLERY_IMAGES} fotos.</Typography>
      )}

      <Grid container spacing={2}>
        {newOnes.map((p,i)=>(
          <Grid item xs={6} key={`new-${i}`}>
            <Card variant="outlined">
              <CardMedia component="img" image={p} height={120} sx={{ objectFit:'cover' }} />
              <Box sx={{ p:1, textAlign:'right' }}>
                <Typography role="button" variant="caption" sx={{ cursor:'pointer' }} onClick={()=> setNewOnes(newOnes.filter((_,idx)=>idx!==i))}>
                  Quitar
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
