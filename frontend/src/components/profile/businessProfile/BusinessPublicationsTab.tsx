// src/components/publications/BusinessPublicationsTab.tsx
import * as React from "react";
import {
  Grid,
  Typography,
  Box,
  Fade,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import PublicationCard from "../../publications/PublicationCard";
import PublicationDetailDialog from "../../publications/PublicationDetailDialog";
import type { BusinessPublicationResponseDTO } from "../../../types/business";
import { MOCK_BUSINESS_PUBLICATIONS } from "../../mocks/businessMocks";

// ──────────────────────────────────────────────
// Mock: obtiene planes del usuario loggeado
// ──────────────────────────────────────────────
async function fetchUserBoardsMock(): Promise<string[]> {
  await new Promise((res) => setTimeout(res, 300));
  return ["Favoritos", "Restaurantes para visitar", "Hoteles soñados"];
}

// ──────────────────────────────────────────────
// Mock de publicaciones
// ──────────────────────────────────────────────
function getBusinessPublications(id: string): BusinessPublicationResponseDTO[] {
  return MOCK_BUSINESS_PUBLICATIONS.get(id) || [];
}

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────
export default function BusinessPublicationsTab({ id }: { id: string }) {
  const [selected, setSelected] = React.useState<BusinessPublicationResponseDTO | null>(null);
  const [showLoginMsg, setShowLoginMsg] = React.useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = React.useState(false);

  const [plans, setPlans] = React.useState<string[]>([]);
  const [plansLoaded, setPlansLoaded] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [targetPublication, setTargetPublication] =
    React.useState<BusinessPublicationResponseDTO | null>(null);

  // Diálogo para crear plan
  const [openCreateDialog, setOpenCreateDialog] = React.useState(false);
  const [newPlanName, setNewPlanName] = React.useState("");

  const publications = getBusinessPublications(id);

  // ───────────────────────────────
  // Manejo de acción "Agregar a plan"
  // ───────────────────────────────
  const handleAddToBoard = async (
    event: React.MouseEvent<HTMLElement>,
    publication: BusinessPublicationResponseDTO,
    token: string
  ) => {
    event.stopPropagation();

    if (!token) {
      setShowLoginMsg(true);
      return;
    }

    setTargetPublication(publication);
    setMenuAnchor(event.currentTarget);

    // Solo fetchear si no se cargaron antes
    if (!plansLoaded) {
      const fetched = await fetchUserBoardsMock();
      setPlans(fetched);
      setPlansLoaded(true);
    }
  };

  // ───────────────────────────────
  // Manejo de selección de plan
  // ───────────────────────────────
  const handleSelectBoard = (boardName: string) => {
    if (boardName === "➕ Crear nuevo plan") {
      setOpenCreateDialog(true);
      return;
    }

    console.log(`📌 Agregando publicación "${targetPublication?.title}" al plan "${boardName}"`);
    setShowSuccessMsg(true);
    handleCloseBoardsMenu();
  };

  const handleCloseBoardsMenu = () => {
    setMenuAnchor(null);
    setTargetPublication(null);
  };

  // ───────────────────────────────
  // Crear nuevo plan
  // ───────────────────────────────
  const handleCreatePlan = () => {
    if (newPlanName.trim()) {
      setPlans((prev) => [...prev, newPlanName.trim()]);
      setShowSuccessMsg(true);
    }
    setOpenCreateDialog(false);
    setNewPlanName("");
    handleCloseBoardsMenu();
  };

  if (!publications || publications.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="h6" fontWeight={600}>
          No hay publicaciones disponibles.
        </Typography>
        <Typography variant="body2">
          Este negocio aún no tiene eventos ni publicaciones activas.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Publicaciones */}
      <Grid
        container
        spacing={3}
        sx={{
          p: { xs: 1, sm: 2 },
          animation: "fadeIn 0.4s ease-in-out",
        }}
      >
        {publications.map((p) => (
          <Grid key={p.id} item xs={12} sm={12} md={6}>
            <Fade in timeout={400}>
              <Box>
                <PublicationCard
                  publication={p}
                  onView={setSelected}
                  onAddToBoard={handleAddToBoard}
                />
              </Box>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo detalle publicación */}
      <PublicationDetailDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        publication={selected}
      />

      {/* Snackbar: login requerido */}
      <Snackbar
        open={showLoginMsg}
        autoHideDuration={4000}
        onClose={() => setShowLoginMsg(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" onClose={() => setShowLoginMsg(false)}>
          Debes iniciar sesión para agregar una publicación a un plan.
        </Alert>
      </Snackbar>

      {/* Snackbar: éxito */}
      <Snackbar
        open={showSuccessMsg}
        autoHideDuration={4000}
        onClose={() => setShowSuccessMsg(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setShowSuccessMsg(false)}>
          Publicación agregada correctamente al plan.
        </Alert>
      </Snackbar>

      {/* Menú contextual con planes */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseBoardsMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={() => handleSelectBoard("➕ Crear nuevo plan")}>
          ➕ Crear nuevo plan
        </MenuItem>
        <Divider />
        {plans.map((p) => (
          <MenuItem key={p} onClick={() => handleSelectBoard(p)}>
            {p}
          </MenuItem>
        ))}
      </Menu>

      {/* Diálogo para crear nuevo plan */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Crear nuevo plan</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del plan"
            fullWidth
            variant="outlined"
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreatePlan} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
