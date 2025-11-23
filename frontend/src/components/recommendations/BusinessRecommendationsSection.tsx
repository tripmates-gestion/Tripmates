import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import type { BusinessPubAccountDataDTO } from "../../types/AccountData";
import { getBusinessAccountRecommendations } from "../../services/recommendations";
import { useAuth } from "../../hooks/useAuth";
import PlaceGrid from "../search/ResultsPlaceGrid";

interface BusinessRecommendationsSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

export function BusinessRecommendationsSection({
  title = "Negocios que te podrían interesar",
  subtitle = "Servicios y alojamientos hechos a tu medida",
  limit = 6,
}: BusinessRecommendationsSectionProps) {
  const { user, accessToken } = useAuth();
  const theme = useTheme();
  const [recommendations, setRecommendations] = useState<BusinessPubAccountDataDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id || !accessToken) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getBusinessAccountRecommendations(user.id, accessToken);
        setRecommendations(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "No pudimos cargar las recomendaciones.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user?.id, accessToken]);

  const visibleRecommendations = useMemo(() => {
    if (!limit) return recommendations;
    return recommendations.slice(0, limit);
  }, [recommendations, limit]);

  if (!user?.id || !accessToken) {
    return null;
  }

  return (
    <Stack spacing={3} sx={{ py: 6 }}>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            textAlign: "center",
            color: theme.palette.text.primary,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="subtitle1"
            sx={{
              textAlign: "center",
              color: theme.palette.text.secondary,
              fontStyle: "italic",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {loading && (
        <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Estamos buscando opciones ideales para vos...
          </Typography>
        </Stack>
      )}

      {!loading && error && (
        <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Intentá nuevamente más tarde.
          </Typography>
        </Stack>
      )}

      {!loading && !error && visibleRecommendations.length === 0 && (
        <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Aún no tenemos recomendaciones para mostrarte.
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Completá tu perfil y seguí explorando para descubrir nuevas experiencias.
          </Typography>
        </Stack>
      )}

      {!loading && !error && visibleRecommendations.length > 0 && (
        <PlaceGrid businessAccounts={visibleRecommendations} />
      )}
    </Stack>
  );
}
