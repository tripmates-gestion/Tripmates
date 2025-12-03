import React, { useEffect, useState } from 'react';
import {
    Box,
    CircularProgress,
    Container,
    Grid,
    Typography,
    Alert
} from '@mui/material';
import BusinessPublicationCard from '../../publications/PublicationCard';
import { getHistoryLikedAPI } from '../../../services/history';
import type { BusinessPublicationResponseDTO } from '../../../types/Business';
import PublicationDetailDialog from '../../publications/PublicationDetailDialog';

interface LikedPublicationsTabProps {
    userId: string;
    accessToken: string;
}

export default function LikedPublicationsTab({ userId, accessToken }: LikedPublicationsTabProps) {
    const [publications, setPublications] = useState<BusinessPublicationResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPublication, setSelectedPublication] = useState<BusinessPublicationResponseDTO | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchLiked = async () => {
            try {
                setLoading(true);
                const data = await getHistoryLikedAPI(userId, accessToken);
                if (mounted) {
                    setPublications(data);
                }
            } catch (err) {
                console.error('Error fetching liked publications:', err);
                if (mounted) {
                    setError('Error al cargar las publicaciones.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        if (userId && accessToken) {
            fetchLiked();
        }

        return () => {
            mounted = false;
        };
    }, [userId, accessToken]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (publications.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                    Publicaciones a las que les diste like
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Aún no has dado like a ninguna publicación.
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Grid container spacing={3}>
                {publications.map((pub) => (
                    <Grid item xs={12} sm={6} md={4} key={pub.id}>
                        <BusinessPublicationCard
                            publication={pub}
                            onView={(p) => setSelectedPublication(p)}
                            // Add other handlers if needed (e.g., onAddToBoard)
                            sx={{ height: '100%' }}
                        />
                    </Grid>
                ))}
            </Grid>

            <PublicationDetailDialog
                open={!!selectedPublication}
                onClose={() => setSelectedPublication(null)}
                publication={selectedPublication}
                letReview={true}
            />
        </>
    );
}
