import * as React from 'react';
import { Box, Stack, Typography, Grid, Chip } from '@mui/material';
import ImageCarousel from '../../../ui/ImageCarousel';
import { InfoRow } from '../../businessPublicProfile/common/BusinessPubProfileLayout';
import { PriceBadge, OpeningDaysRow } from "../../businessPublicProfile/Utils";
import { formatHours } from '../../../../pages/utils/Utils';
import { BUSINESS_TYPES } from '../../../../constants/Rol';
import type { BusinessUser, BusinessCommon, RestaurantExtras } from '../../../../types/PrivateUserProfiles';

function isRestaurant(
    b: BusinessUser
): b is BusinessCommon & { businessType: 'RESTAURANT' } & RestaurantExtras {
    return b.businessType === 'RESTAURANT';
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                {title}
            </Typography>
            {children}
        </Box>
    );
}

interface BusinessPresentationTabProps {
    business: BusinessUser;
}

export default function BusinessPresentationTab({ business }: BusinessPresentationTabProps) {
    return (
        <Stack spacing={3}>
            <Box sx={{ p: 2, maxWidth: 800, mx: 'auto', width: '100%', alignSelf: 'center' }}>
                {!business.profileImageUrls || business.profileImageUrls.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Aún no subiste fotos a tu perfil.
                    </Typography>
                ) : (
                    <ImageCarousel
                        images={business.profileImageUrls ?? []}
                        aspectRatio={16 / 9}
                        height={300}
                        fit="contain"
                    />
                )}
            </Box>

            <Grid container spacing={3} alignItems="flex-start">
                <Grid item xs={12} md={7}>
                    {!!business.description && (
                        <Section title="Descripción">
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ lineHeight: 1.7 }}
                            >
                                {business.description}
                            </Typography>
                        </Section>
                    )}

                    {isRestaurant(business) ? (
                        <>
                            <Section title="Atención">
                                <OpeningDaysRow openingDays={business.openingDays} />
                            </Section>

                            <Section title="Detalles del restaurante">
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    flexWrap="wrap"
                                    alignItems="center"
                                >
                                    {business.attentionSchedule && (
                                        <Chip
                                            size="small"
                                            variant="outlined"
                                            label={formatHours(business.attentionSchedule)}
                                        />
                                    )}
                                    {!!business.restaurantType && (
                                        <Chip
                                            size="small"
                                            variant="outlined"
                                            label={business.restaurantType}
                                        />
                                    )}
                                    {!!business.averagePrice && (
                                        <PriceBadge value={business.averagePrice} />
                                    )}
                                </Stack>
                            </Section>
                        </>
                    ) : business.businessType === BUSINESS_TYPES.hotel ? (
                        <>
                            <Section title="Detalles del hotel">
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    flexWrap="wrap"
                                    alignItems="center"
                                >
                                    {!!business.hotelType && (
                                        <Chip
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                            label={business.hotelType}
                                            sx={{
                                                fontWeight: 600,
                                                textTransform: 'capitalize',
                                            }}
                                        />
                                    )}
                                    {!!business.averagePrice && (
                                        <PriceBadge value={business.averagePrice} />
                                    )}
                                </Stack>
                            </Section>
                        </>
                    ) : null}
                </Grid>

                <Grid item xs={12} md={5}>
                    <Section title="Contacto">
                        <InfoRow label="Ubicación" value={business.location} icon="📍" />
                        <InfoRow label="Teléfono" value={business.phoneNumber} icon="📞" />
                        <InfoRow label="Correo de contacto" value={business.publicEmail} icon="✉️" />
                    </Section>
                </Grid>
            </Grid>
        </Stack>
    );
}
