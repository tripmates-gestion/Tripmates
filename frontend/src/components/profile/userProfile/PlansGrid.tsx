import React from 'react';
import { Avatar, AvatarGroup, Box, Chip, Collapse, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Delete, Edit, ExpandMore, ExpandLess, PersonAddAlt1 } from '@mui/icons-material';
import type { BusinessPublicationResponseDTO } from '../../../types/Business';
import type { CommonUser } from '../../../types/PrivateUserProfiles';
import type { Plan } from '../../../types/Plans';
import PublicationCard from '../../publications/PublicationCard';
import PublicationDetailDialog from '../../publications/PublicationDetailDialog';

interface PlansGridProps {
  plans: Plan[];
  expandedPlans: Set<number>;
  togglePlanExpansion: (index: number) => void;
  openDeleteDialog: (plan: Plan) => void;
  onEditPlan: (plan: Plan) => void;
  onInvite: (plan: Plan) => void;
  usersById: Record<string, CommonUser | undefined>;
  onUserClick?: (userId: string) => void;
}

export default function PlansGrid({
  plans,
  expandedPlans,
  togglePlanExpansion,
  openDeleteDialog,
  onEditPlan,
  onInvite,
  usersById,
  onUserClick
}: PlansGridProps) {

  const [selected, setSelected] = React.useState<BusinessPublicationResponseDTO | null>(null);

  return (
    <>
      {plans.map((plan, index) => {
        const isExpanded = expandedPlans.has(index);
        const publicationCount = plan.publications?.length || 0;
        const owner = usersById[plan.ownerId];
        const collaborators = plan.collaboratorsIds ?? [];

        const renderUserAvatar = (userId: string, fallbackLabel: string) => {
          const user = usersById[userId];
          const label = user?.name ?? fallbackLabel;
          return (
            <Tooltip title={label} key={userId}>
              <Avatar
                src={user?.avatarURL}
                alt={label}
                onClick={(e) => {
                  e.stopPropagation();
                  onUserClick?.(userId);
                }}
                sx={{
                  width: 36,
                  height: 36,
                  cursor: onUserClick ? 'pointer' : 'default',
                  border: (theme) => `2px solid ${theme.palette.background.paper}`,
                  bgcolor: (theme) => user ? theme.palette.primary.main : theme.palette.grey[700],
                  color: 'white',
                }}
              >
                {label.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          );
        };

        return (
          <Grid item xs={12} key={index}>
            <Box
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: 1,
                backgroundColor: 'background.paper',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Header del plan - siempre visible */}
              <Box
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
                onClick={() => togglePlanExpansion(index)}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {plan.name}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={`${publicationCount} ${publicationCount === 1 ? 'publicación' : 'publicaciones'}`}
                      size="small"
                      variant="outlined"
                    />

                    <Tooltip title="Invitar a este plan">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onInvite(plan);
                        }}
                        sx={{
                          color: 'secondary.main',
                          '&:hover': {
                            backgroundColor: 'secondary.light',
                            color: 'secondary.contrastText'
                          }
                        }}
                        size="small"
                      >
                        <PersonAddAlt1 />
                      </IconButton>
                    </Tooltip>

                    {/* Botones de editar y eliminar alineados con el chip */}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Botón editar clickeado');
                        onEditPlan(plan);
                      }}
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText'
                        }
                      }}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(plan);
                      }}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: 'error.light',
                          color: 'error.contrastText'
                        }
                      }}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                    
                    <IconButton size="small">
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Stack>
                </Stack>

                {plan.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                    {plan.description}
                  </Typography>
                )}

                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
                  <Chip
                    label="Creador"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ borderStyle: 'dashed' }}
                  />
                  {renderUserAvatar(plan.ownerId, owner?.name ?? 'Dueño del plan')}

                  {collaborators.length > 0 && (
                    <>
                      <Chip
                        label="Invitados"
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ borderStyle: 'dashed' }}
                      />
                      <AvatarGroup max={6} sx={{ '& .MuiAvatar-root': { width: 36, height: 36 } }}>
                        {collaborators.map((id) => renderUserAvatar(id, 'Invitado'))}
                      </AvatarGroup>
                    </>
                  )}
                </Stack>
              </Box>

              {/* Contenido desplegable */}
              <Collapse in={isExpanded}>
                <Box sx={{ px: 2, pb: 2 }}>
                  {plan.publications && plan.publications.length > 0 ? (
                    <Grid container spacing={2}>
                      {plan.publications.map((publication: BusinessPublicationResponseDTO, pubIndex) => (
                        <Grid item xs={12} sm={6} key={pubIndex}>
                          <Box>
                            <PublicationCard 
                              publication={publication}
                              onView={setSelected}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, fontStyle: 'italic', textAlign: 'center' }}>
                      Plan vacío - Agrega publicaciones desde la sección de búsqueda
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </Box>
          </Grid>
        );
      })}

      {/* Diálogo de detalle de publicación */}
      <PublicationDetailDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        publication={selected}
        letReview={true}
      />
    </>
  );
}