import { Typography, Card, CardContent, CardMedia, Grid, Stack, Avatar, Chip } from "@mui/material";
import type { Review } from "../../types/review";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById } from "../../services/searchService";
import { useAuth } from "../../hooks/useAuth";


async function getUser(accessToken: string, userName: string, userId: string) {
    const result = await getUserById(accessToken, userName);
    console.log("Resultado de getUserById:", result);
    const content = await result.json();
    const user = content.find((u: any) => u.id === userId);
    
    if (!user) {
        throw new Error(`Usuario con ID ${userId} no encontrado`);
    }
    
    return user;
}



export function ReviewGrid({ items }: { items: Review[] }) {

    const accessToken = useAuth().accessToken;
    const navigate = useNavigate();

    const handleUserClick = useCallback(async (authorName: string, authorId: string) => {
        console.log("Haciendo click en usuario:", authorName);
        try {
            const user = {username: authorName, id: authorId}; // Agregar await
            console.log("Usuario obtenido:", user);
            navigate(`/userProfile/${authorId}`, {
                state: { account: user } 
            });
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }, [navigate, accessToken]);

    return (
    <Grid container spacing={2}>
        {items.map((r: Review) => (
            <Grid key={r.id} item xs={12}>
            <Card variant="outlined">
            <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1, cursor: 'pointer' }}
                // onClick={(e) => {
                // console.log("Review seleccionada:", r);
                // e.stopPropagation();
                // handleUserClick(r.authorName, r.authorId);}}
                >
                <Avatar src={r.avatarUrl} />
                <Stack spacing={0}>
                    <Typography variant="subtitle2" fontWeight={700}>{r.authorName}</Typography>
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