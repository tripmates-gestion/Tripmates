import { Typography, Card, CardContent, CardMedia, Grid, Stack, Avatar, Chip } from "@mui/material";
import type { Review } from "../../types/Review";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getUserByEmail } from "../../services/userService";
import { renderTextWithMentions } from "./NewReviewPlace";

// Componente para renderizar el texto con menciones de forma async
function ReviewTextWithMentions({ 
  text, 
  accessToken, 
  onMentionClick 
}: { 
  text: string; 
  accessToken: string; 
  onMentionClick: (email: string) => void;
}) {
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>(text);

  useEffect(() => {
    const loadMentions = async () => {
      try {
        const content = await renderTextWithMentions(
          text,
          accessToken,
          (mention) => onMentionClick(mention.email)
        );
        setRenderedContent(content);
      } catch (error) {
        console.error('Error rendering mentions:', error);
        setRenderedContent(text);
      }
    };

    loadMentions();
  }, [text, accessToken, onMentionClick]);

  return <>{renderedContent}</>;
}

export function ReviewGrid({ items }: { items: Review[] }) {

    const accessToken = useAuth().accessToken;
    const navigate = useNavigate();

    const handleUserClick = useCallback(async (authorName: string, authorId: string) => {
        console.log("Haciendo click en usuario:", authorName);
        try {
            const user = await getUserByEmail(authorName, accessToken!);
            console.log("Usuario obtenido:", user);
            navigate(`/userProfile/${authorId}`, {
                state: { account: user } 
            });
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }, [navigate, accessToken]);

    const handleTaggedUserClick = useCallback(async (email: string) => {
        console.log("Usuario mencionado (email):", email);
        try {
            const mentionedUser = await getUserByEmail(email, accessToken!);
            console.log("Usuario obtenido:", mentionedUser);
            navigate(`/userProfile/${mentionedUser.id}`, {
                state: { account: mentionedUser }
            });
        } catch (error) {
            console.error('Error fetching tagged user:', error);
        }
    }, [navigate, accessToken]);

    return (
    <Grid container spacing={2}>
        {items.map((r: Review) => (
            <Grid key={r.id} item xs={12}>
            <Card variant="outlined">
            <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1, cursor: 'pointer' }}
                onClick={(e) => {
                console.log("Review seleccionada:", r);
                e.stopPropagation();
                handleUserClick(r.authorName, r.authorId);}}
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
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              <ReviewTextWithMentions
                text={r.text}
                accessToken={accessToken!}
                onMentionClick={handleTaggedUserClick}
              />
            </Typography>
  
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