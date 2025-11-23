import * as React from 'react';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    target: number;
    icon: React.ReactNode;
    color: string;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
    {
        id: 'firstLike',
        title: 'Primer paso',
        description: 'Recibiste tu primer like en una publicación.',
        target: 1,
        icon: <ThumbUpIcon fontSize="large" />,
        color: '#CD7F32', // Bronze
    },
    {
        id: '10Likes',
        title: 'Ganando tracción',
        description: 'Acumulaste 10 likes en tus publicaciones.',
        target: 10,
        icon: <StarIcon fontSize="large" />,
        color: '#C0C0C0', // Silver
    },
    {
        id: '50Likes',
        title: 'Favorito local',
        description: 'Llegaste a los 50 likes. ¡A la gente le gusta lo que haces!',
        target: 50,
        icon: <EmojiEventsIcon fontSize="large" />,
        color: '#FFD700', // Gold
    },
    {
        id: '100Likes',
        title: 'Tendencia',
        description: '¡100 likes! Tu negocio está en boca de todos.',
        target: 100,
        icon: <VerifiedIcon fontSize="large" />,
        color: '#00BFFF', // Deep Sky Blue
    },
    {
        id: '1000Likes',
        title: 'Leyenda',
        description: '1000 likes. Eres un referente en la comunidad.',
        target: 1000,
        icon: <WorkspacePremiumIcon fontSize="large" />,
        color: '#9932CC', // Dark Orchid
    },
];
