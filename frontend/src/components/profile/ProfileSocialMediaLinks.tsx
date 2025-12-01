import React from "react";
import { Box, CircularProgress, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import EditIcon from "@mui/icons-material/Edit";
import { getUserSocialMedia, type SocialMediaLinks } from "../../services/socialMedia";
import EditSocialMediaDialog from "./EditSocialMediaDialog";
import { useAuth } from "../../hooks/useAuth";

interface ProfileSocialMediaLinksProps {
  email: string;
  canEdit?: boolean;
}

const SOCIAL_ITEMS: Array<{
  key: keyof SocialMediaLinks;
  label: string;
  icon: React.ReactElement;
}> = [
  { key: "instagramURL", label: "Instagram", icon: <InstagramIcon /> },
  { key: "xURL", label: "X / Twitter", icon: <TwitterIcon /> },
  { key: "facebookURL", label: "Facebook", icon: <FacebookIcon /> },
];

export default function ProfileSocialMediaLinks({ email, canEdit = false }: ProfileSocialMediaLinksProps) {
  const [links, setLinks] = React.useState<SocialMediaLinks | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { accessToken } = useAuth();

  React.useEffect(() => {
    let mounted = true;
    const fetchLinks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserSocialMedia(email, accessToken);
        if (mounted) {
          setLinks(data ?? {});
        }
      } catch (e) {
        if (mounted) {
          const message = e instanceof Error ? e.message : "No pudimos cargar las redes sociales.";
          setError(message);
          setLinks({});
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchLinks();
    return () => {
      mounted = false;
    };
  }, [email]);

  const hasLinks = React.useMemo(() => {
    if (!links) return false;
    return Boolean(links.instagramURL || links.xURL || links.facebookURL);
  }, [links]);

  const handleUpdated = (next: SocialMediaLinks) => {
    setLinks(next);
  };

  if (loading) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">
          Cargando redes...
        </Typography>
      </Stack>
    );
  }

  if (error && !canEdit) {
    return (
      <Typography variant="body2" color="error">
        {error}
      </Typography>
    );
  }

  const iconButtons = SOCIAL_ITEMS.map(({ key, label, icon }) => {
    const url = links?.[key];
    if (!url) return null;

    return (
      <Tooltip key={key} title={label}>
        <IconButton
          size="small"
          color="primary"
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {icon}
        </IconButton>
      </Tooltip>
    );
  }).filter(Boolean) as React.ReactElement[];

  const shouldRender = hasLinks || canEdit;
  if (!shouldRender) return null;

  const content = error ? (
    <Typography variant="body2" color="error">
      {error}
    </Typography>
  ) : hasLinks ? (
    iconButtons
  ) : (
    <Typography variant="body2" color="text.secondary">
      Aún no hay redes sociales cargadas.
    </Typography>
  );

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center">
        {content}

        {canEdit && (
          <Tooltip title="Editar redes sociales">
            <IconButton size="small" onClick={() => setDialogOpen(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {canEdit && (
        <EditSocialMediaDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          initialValues={links ?? {}}
          onUpdated={handleUpdated}
        />
      )}
    </Box>
  );
}