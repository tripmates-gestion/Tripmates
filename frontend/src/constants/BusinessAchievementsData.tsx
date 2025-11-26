import * as React from 'react';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ForumIcon from '@mui/icons-material/Forum';
import CampaignIcon from '@mui/icons-material/Campaign';
import WhatshotIcon from '@mui/icons-material/Whatshot';

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
    {
        id: 'firstReview',
        title: 'Primera Reseña',
        description: '¡Tu primera reseña! Un cliente ha compartido su experiencia contigo.',
        target: 1,
        icon: <RateReviewIcon fontSize="large" />,
        color: '#9932CC',
    },
    {
        id: '10Reviews',
        title: 'Generando Conversación',
        description: 'Ya tienes 10 reseñas. Tu negocio está dando de qué hablar.',
        target: 10,
        icon: <ForumIcon fontSize="large" />,
        color: '#f5bbd9ff',
    },
    {
        id: '50Reviews',
        title: 'Favorito Local',
        description: '¡50 reseñas! Te estás convirtiendo en un referente de la comunidad.',
        target: 50,
        icon: <CampaignIcon fontSize="large" />,
        color: '#FFD700', // Gold
    },
    {
        id: '100Reviews',
        title: 'En Llamas',
        description: '¡100 reseñas! Tu negocio está on fire, ¡todos quieren opinar!',
        target: 100,
        icon: <WhatshotIcon fontSize="large" />,
        color: '#FF5722',
    },
];
