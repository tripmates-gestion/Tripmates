// BusinessMetricsDialog.tsx
import * as React from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
  Chip,
  Divider,
} from '@mui/material';


import {
  type TimeSeriesMetric,
  type LikesMetric,
  getLikesMetrics,
  getProfileViewsMetrics,
  getReviewsMetrics,
} from '../../services/metricsService';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';


import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';

import Box from '@mui/material/Box';
import { useTheme, alpha } from '@mui/material/styles';



// ----- Helpers -----

interface SparkPoint {
  date: string; // MM-DD
  count: number;
}

function buildDailySeries(events: string[], days: number): SparkPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const counts = new Map<string, number>();

  for (const ts of events ?? []) {
    const d = new Date(ts);
    if (isNaN(d.getTime())) continue;
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const data: SparkPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    data.push({
      date: key.slice(5), // MM-DD
      count: counts.get(key) ?? 0,
    });
  }

  return data;
}

function formatTotalLabel(value: number | null | undefined) {
  if (value == null) return '–';
  if (value >= 1000) return value.toLocaleString('es-AR');
  return String(value);
}

// ----- Componentes UI -----

interface TimeSeriesCardProps {
  label: string;
  metric: TimeSeriesMetric | null;
  loading: boolean;
  days: number;
  onDaysChange: (value: number) => void;
  accent?: 'primary' | 'secondary';
}

function TimeSeriesCard({
  label,
  metric,
  loading,
  days,
  onDaysChange,
  accent = 'primary',
}: TimeSeriesCardProps) {
  const total = metric?.totalQuantity ?? null;
  const data = React.useMemo(
    () => (metric ? buildDailySeries(metric.events, days) : []),
    [metric, days]
  );

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {label}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              type="number"
              size="small"
              value={days}
              onChange={(e) => {
                const value = Number(e.target.value);
                onDaysChange(Number.isFinite(value) ? Math.max(1, value) : 1);
              }}
              inputProps={{ min: 1 }}
              sx={{ width: 90 }}
            />
            <Chip
              size="small"
              label={`Últimos ${days} días`}
              color={accent}
              variant="outlined"
            />
          </Stack>
        </Stack>

        <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
          {loading ? <CircularProgress size={22} /> : formatTotalLabel(total)}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Total en el período
        </Typography>

        <BoxSparkline data={data} loading={loading} />
      </CardContent>
    </Card>
  );
}

interface BoxSparklineProps {
  data: SparkPoint[];
  loading: boolean;
}

function BoxSparkline({ data, loading }: BoxSparklineProps) {
    const theme = useTheme();
    const axisColor = theme.palette.text.secondary;
    const lineColor =
      theme.palette.mode === 'dark'
        ? theme.palette.primary.light
        : theme.palette.primary.main;
    const areaColor = alpha(lineColor, 0.25);
  
    return (
      <Box
        sx={{
          mt: 1.5,
          height: 140,
          width: '100%',
          minWidth: 0,
        }}
      >
        {loading ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: '100%' }}
          >
            <CircularProgress size={20} />
          </Stack>
        ) : data.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            Sin actividad registrada en este intervalo.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={areaColor} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={areaColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                stroke={axisColor}
                tick={{ fontSize: 10, fill: axisColor }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                stroke={axisColor}
                tick={{ fontSize: 10, fill: axisColor }}
                width={24}
                domain={[0, 'dataMax']}    
                allowDecimals={false}           
                interval="preserveStartEnd"      
              />
              <Tooltip
                cursor={{ opacity: 0.1 }}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                }}
                formatter={(value: any) => [`${value} eventos`, 'Cantidad']}
                labelFormatter={(label) => `Día ${label}`}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#sparklineGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>
    );
  }
  
interface LikesCardProps {
    label: string;
    value: LikesMetric | null;
    loading: boolean;
  }
  
  function LikesCard({ label, value, loading }: LikesCardProps) {
    return (
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          width: '100%',
          maxWidth: 320,
          mx: 'auto',
        }}
      >
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {label}
            </Typography>
            {/* <Chip
              size="small"
              label={`Likes`}
              color="primary"
              variant="outlined"
            /> */}
          </Stack>
  
          <Stack spacing={0.5} sx={{ mt: 1.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ThumbUpAltOutlinedIcon fontSize="small" />
              <Typography variant="h4" fontWeight={800}>
                {loading ? <CircularProgress size={22} /> : formatTotalLabel(value)}
              </Typography>
            </Stack>
  
            <Typography variant="caption" color="text.secondary">
              Likes totales historicos
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }
  
// ----- Dialog principal -----

interface BusinessMetricsDialogProps {
  open: boolean;
  onClose: () => void;
  accessToken: string | null;
}

export function BusinessMetricsDialog({
  open,
  onClose,
  accessToken,
}: BusinessMetricsDialogProps) {
  const [reviewsDays, setReviewsDays] = React.useState(30);
  const [viewsDays, setViewsDays] = React.useState(30);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const [metrics, setMetrics] = React.useState<{
    reviews: TimeSeriesMetric | null;
    views: TimeSeriesMetric | null;
    likes: LikesMetric | null;
  }>({
    reviews: null,
    views: null,
    likes: null,
  });

  const handleRefreshAll = React.useCallback(async () => {
    if (!accessToken) {
      setError('No estás autenticado.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [reviews, views, likes] = await Promise.all([
        getReviewsMetrics(reviewsDays, accessToken),
        getProfileViewsMetrics(viewsDays, accessToken),
        // usamos el mismo rango de días que las vistas para los likes
        getLikesMetrics(viewsDays, accessToken),
      ]);

      setMetrics({ reviews, views, likes });
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e?.message || 'No se pudieron cargar las métricas.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, reviewsDays, viewsDays]);

  // Carga inicial al abrir el diálogo (una sola vez por apertura)
  React.useEffect(() => {
    if (!open) return;
    if (!accessToken) {
      setError('No estás autenticado.');
      return;
    }

    setLoading(true);
    setError(null);

    const currentReviewsDays = reviewsDays;
    const currentViewsDays = viewsDays;

    Promise.all([
      getReviewsMetrics(currentReviewsDays, accessToken),
      getProfileViewsMetrics(currentViewsDays, accessToken),
      getLikesMetrics(currentViewsDays, accessToken),
    ])
      .then(([reviews, views, likes]) => {
        setMetrics({ reviews, views, likes });
        setLastUpdated(new Date());
      })
      .catch((e: any) => {
        setError(e?.message || 'No se pudieron cargar las métricas.');
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, accessToken]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Métricas del perfil</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Visualizá de forma rápida el comportamiento de tu perfil (reviews,
          vistas y likes) en los últimos días.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Button
            variant="contained"
            onClick={handleRefreshAll}
            disabled={loading}
          >
            Actualizar métricas
          </Button>

          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Última actualización:{' '}
              {lastUpdated.toLocaleString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
              })}
            </Typography>
          )}
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Divider sx={{ my: 1 }} />

        <Grid container spacing={2}>
            <Grid item xs={12} md={8} sx={{ minWidth: 0 }}>
                <Stack spacing={2}>
                <TimeSeriesCard
                    label="Reviews"
                    metric={metrics.reviews}
                    loading={loading}
                    days={reviewsDays}
                    onDaysChange={setReviewsDays}
                    accent="secondary"
                />
                <TimeSeriesCard
                    label="Vistas al perfil"
                    metric={metrics.views}
                    loading={loading}
                    days={viewsDays}
                    onDaysChange={setViewsDays}
                    accent="primary"
                />
                </Stack>
            </Grid>

            <Grid
                item
                xs={12}
                md={4}
                sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: { xs: 'stretch', md: 'center' },
                }}
            >
                <LikesCard
                label="Likes"
                value={metrics.likes}
                loading={loading}
                />
            </Grid>
        </Grid>

      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
