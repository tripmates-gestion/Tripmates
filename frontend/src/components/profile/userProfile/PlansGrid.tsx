import React from 'react';
import { Grid, Box, Stack, Typography, Chip, IconButton, Collapse } from '@mui/material';
import { Delete, Edit, ExpandMore, ExpandLess } from '@mui/icons-material';
import type { BusinessPublicationResponseDTO } from '../../../types/Business';
import PublicationCard from '../../publications/PublicationCard';
import PublicationDetailDialog from '../../publications/PublicationDetailDialog';

export interface Plan {
  id?: string;
  name: string;
  description: string;
  publications: BusinessPublicationResponseDTO[];
}

interface PlansGridProps {
  plans: Plan[];
  expandedPlans: Set<number>;
  togglePlanExpansion: (index: number) => void;
  openDeleteDialog: (plan: Plan) => void;
  onEditPlan: (plan: Plan) => void; // Nueva prop para edición
}

export default function PlansGrid({ 
  plans, 
  expandedPlans, 
  togglePlanExpansion, 
  openDeleteDialog,
  onEditPlan
}: PlansGridProps) {

  const [selected, setSelected] = React.useState<BusinessPublicationResponseDTO | null>(null);

  return (
    <>
      {plans.map((plan, index) => {
        const isExpanded = expandedPlans.has(index);
        const publicationCount = plan.publications?.length || 0;
        
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