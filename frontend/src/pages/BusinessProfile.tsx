import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import Settings from '@mui/icons-material/Settings';
import Edit from '@mui/icons-material/Edit';
import ComplementBusinessProfileDialog from '../components/profile/businessProfile/ComplementProfileDialog';
import type { UpdateProfileFormState } from '../types/business';
import { useAuth } from '../hooks/useAuth';
import { DEFAULT_STATS } from '../constants/DefaultStats'
import {BusinessPublicationsTab} from '../components/profile/businessProfile/businessPublicationTab';
import { Stat } from '../components/profile/stats';
import { EmptyState } from '../components/profile/EmptyState';
import type { CommonUsersInformation } from '../types/user';
import type { CompleteBusinessProfile } from '../types/business';
import { DEFAULT_OPENING_DAYS } from '../types/business';
import { updateBusinessUser } from '../services/userService';
import type { BusinessUpdateRequestDTO } from '../types/business';
import { mapDaysToEnglish, parseHours } from '../types/business';
import { dataURLtoFile } from '../components/publications/utils/imageHelpers';

// ----- defaults hardcodeados cuando el back no los provee -----
const DEFAULT_COVER_URL = 'https://png.pngtree.com/background/20250119/original/pngtree-mountain-scenery-natural-banner-images-picture-image_16218538.jpg'; // si querés una imagen placeholder poné acá la URL
const businessRoleChipColor = 'warning';
const tabs = [
  { key: 'mi presentacion', label: 'Mi Presentación' },
  {key: 'publicaciones', label: 'Publicaciones'},
  { key: 'fotos', label: 'Fotos' },
];


// ----- util: mapea CommonUsersInformation (información básica de autenticación) -> CompleteBusinessProfile (estado del perfil en front) -----
function toUserProfile(u: CommonUsersInformation | null | undefined, prev?: CompleteBusinessProfile): CompleteBusinessProfile {
  return {
    name:                   u?.username ?? prev?.name ?? '',
    description:            u?.description ?? prev?.description ?? '',
    openningDays:           prev?.openningDays ?? DEFAULT_OPENING_DAYS,
    openingHours:           prev?.openingHours ?? null,
    location:               prev?.location ?? '',
    phone:                  prev?.phone ?? '',
    onCloudPhotos:          prev?.onCloudPhotos ?? [],

    avatarUrl: (u?.avatarURL && u.avatarURL.trim() !== '') 
      ? u.avatarURL 
      : (prev?.avatarUrl),
    coverUrl: prev?.coverUrl ?? DEFAULT_COVER_URL,
    stats: prev?.stats ?? DEFAULT_STATS,
  };
}


export default function BusinessProfile() {
  const [tab, setTab] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);
  const { user, token ,updateUser} = useAuth();

  //posiblemente se borre el estado de perfil cada vez que se quiera editar los datos (aun cuand se cancelan los cambios)
  const [completeProfile, setCompleteProfile] = React.useState<CompleteBusinessProfile>(() => toUserProfile(user));

  // React.useEffect(() => {
  //   setCompleteProfile((prev) => toUserProfile(user, prev));
  // }, [user]);


  // ayuda para saber si el tab actual es "publicaciones"
  const currentTabKey = tabs[tab]?.key;
  const saveChangesInBackend = async (formContent: UpdateProfileFormState) => { 
       
    if (!token) {
      console.error('No auth token available; skipping remote update');
      return;
    }

    try{
      const data : BusinessUpdateRequestDTO = {
        name: formContent.name.trim(),
        description: formContent.description,
        openingDays: mapDaysToEnglish(
          formContent.openningDays
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean) // elimina vacíos
        ),
        attentionSchedule: parseHours(formContent.openingHours),
        location: formContent.location.trim(),
        phoneNumber: formContent.phone.trim(),
      }

      const files: File[] = formContent.uploadingPhotos
        .filter(Boolean)
        .map((photo, i) => dataURLtoFile(photo, `photo_${i + 1}.jpg`));
      
      const avatarFile = formContent.avatar
        ? dataURLtoFile(formContent.avatar, "avatar.jpg")
        : null;  
      console.log("Avatar base64 (primeros 200 caracteres):", formContent.avatar?.slice(0, 200));
      console.log("AvatarFile:", avatarFile);
      
      const response = await updateBusinessUser(data, avatarFile, files, token);

      console.log("ANTES (avatar URL):", completeProfile.avatarUrl);
      console.log("RESPUESTA BACK (avatar URL):", response.avatarURL);

      
      // console.log(response)

      const updatedProfile: CompleteBusinessProfile = {
        ...completeProfile, // mantenemos los campos no modificados
        name: response.name,
        description: response.description,
        openningDays: response.openingDays,
        openingHours: response.attentionSchedule,
        location: response.location,
        phone: response.phoneNumber,
        avatarUrl: response.avatarURL ? response.avatarURL : completeProfile.avatarUrl, // nota: el backend devuelve `avatarURL` (camel case distinto)
        onCloudPhotos: response.profileImageUrls, // corresponde a las imágenes subidas
        stats: completeProfile.stats, // se conserva el objeto de estadísticas local
      };
      setCompleteProfile(updatedProfile);
      //Actualizo información básica de auth
      updateUser(response.name, response.description, response.avatarURL);
      console.log("Perfil actualizado correctamente:", updatedProfile);
      setTimeout(() => {
        console.log("DESPUÉS:", completeProfile.avatarUrl);
      }, 1000);

    } catch(error){
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Banner de fondo */}
      <Box
        sx={{
          minHeight: { xs: '38vh', md: '30vh' },
          position: 'relative',
          backgroundImage: completeProfile.coverUrl ? `url(${completeProfile.coverUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Card */}
      <Box sx={{ position: 'relative' }}>
        <Card
          elevation={1}
          sx={{
            maxWidth: 1180, width: '100%', mx: 'auto',
            mt: { xs: -8, md: -10 }, borderRadius: 2, overflow: 'visible',
          }}
        >
          <CardContent sx={{ pb: 1.5 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
              <Avatar
                src={completeProfile.avatarUrl}
                alt={completeProfile.name}
                sx={{
                  width: 96, height: 96, mt: { xs: -6, md: -8 },
                  border: (t) => `4px solid ${t.palette.background.paper}`,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h5" fontWeight={800}>{completeProfile.name}</Typography>
                  {!!user?.role && (
                    <Chip
                      size="small"
                      label={user.role}
                      color={businessRoleChipColor}
                      variant="outlined"
                      sx={{ ml: 0.5 }}
                    />
                  )}
                </Stack>

                {completeProfile.description && (
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {completeProfile.description}
                  </Typography>
                )}
              </Box>

              <ButtonGroup variant="outlined" size="small">
                <Button startIcon={<Edit />} onClick={() => setEditOpen(true)}>Completá los datos de tu negocio!</Button>
                <Button startIcon={<Settings />}>Configuración</Button>
              </ButtonGroup>
            </Stack>

            {/* Stats */}
            <Stack direction="row" spacing={4} alignItems="center" sx={{ mt: 2, px: { xs: 2, sm: 3, md: 4 } }}>
              <Stat label="Aportes" value={completeProfile.stats.aportes} />
              <Stat label="Seguidores" value={completeProfile.stats.seguidores} />
              <Stat label="Siguiendo" value={completeProfile.stats.siguiendo} />
            </Stack>
          </CardContent>

          <Divider />
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{ px: { xs: 1, sm: 2, md: 3 } }}
            >
              {tabs.map((t) => <Tab key={t.key} label={t.label} />)}
            </Tabs>
          <Divider />

          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {currentTabKey === 'mi presentacion'  && <EmptyState title="Presentación de mi negocio" />}
            {currentTabKey === 'fotos'            && <EmptyState title="Fotos" />}
            {currentTabKey === 'publicaciones'    && (
              <BusinessPublicationsTab token={token} />
            )}
          </Box>
        </Card>
      </Box>

      {/* Modal de edición */}
      <ComplementBusinessProfileDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        completeProfile={completeProfile}
        onSave={saveChangesInBackend}
      />
    </Box>
  );
}



