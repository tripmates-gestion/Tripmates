import { Typography, Card, CardContent, CardMedia, Grid, Stack, Avatar, Chip } from "@mui/material";
import type { Review } from "../../types/review";

export function ReviewGrid({ items }: { items: Review[] }) {
    return (
    <Grid container spacing={2}>
        {items.map((r: Review) => (
            <Grid key={r.id} item xs={12}>
            <Card variant="outlined">
            <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Avatar>{r.author.slice(0, 1).toUpperCase()}</Avatar>
                <Stack spacing={0}>
                    <Typography variant="subtitle2" fontWeight={700}>{r.author}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(r.createdAt).toLocaleString()}
                    </Typography>
                </Stack>
                {!!r.rating && (
                <Chip
                    size="small"
                    label={<><strong>{r.rating.toFixed(1)}</strong> ★</>}
                    sx={{ ml: "auto" }}
                />
                )}
            </Stack>
  
            {/* Referencia a la publicación (opcional) */}
            {r.publicationTitle && (
                <Chip
                    label={`Sobre: ${r.publicationTitle}`}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1 }}
                />
            )}
  
            {/* Título + texto */}
            <Typography variant="subtitle1" fontWeight={700}>{r.title}</Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{r.text}</Typography>
  
            {/* Galería */}
            {r.images.length > 0 && (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                {r.images.map((img: string, i: number) => (
                <Grid key={i} item xs={6} sm={4} md={3}>
                    <Card variant="outlined" sx={{ position: "relative" }}>
                    <CardMedia component="img" image={img} height={120} />
                    </Card>
                </Grid>
                ))}
                </Grid>
            )}
            </CardContent>
            </Card>
            </Grid>
        ))}
        </Grid>
    );
}