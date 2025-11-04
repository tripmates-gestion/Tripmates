// src/components/restaurant/RestaurantMenuTab.tsx
import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import RestaurantMenuGrid from "./RestaurantMenuGrid";
import MenuEditorDialog from "./MenuEditorDialog";
import type { MenuItem } from "../../../../types/Restaurant";
import {
  appendMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../../../services/restauranteMenu";
import { useBusinessProfile } from "../../../../hooks/useBusinessProfile";

type Props = {
  accessToken: string;
  initialMenu: MenuItem[];
  onBusinessReload?: (nextBusiness: any) => void;
};

type UpdatePayload = {
  data: Partial<Omit<MenuItem, "photosURLs">>;
  files: File[];
  deletePhotoIndexes?: number[];
};

export default function RestaurantMenuTab({
  accessToken,
  initialMenu,
  onBusinessReload,
}: Props) {
  const [items, setItems] = React.useState<MenuItem[]>(initialMenu ?? []);
  const [openNew, setOpenNew] = React.useState(false);
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  // estado para confirmación de borrado
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [toDeleteIndex, setToDeleteIndex] = React.useState<number | null>(null);

  const { business } = useBusinessProfile();

  React.useEffect(() => {
    setItems(initialMenu ?? []);
  }, [initialMenu]);

  const setFromBusiness = (res: any) => {
    setItems(res?.menu ?? res?.menuItems ?? []);
    onBusinessReload?.(res);
  };

  const handleCreate = async (payload: {
    data: Omit<MenuItem, "photosURLs">;
    files: File[];
  }) => {
    try {
      setLoading(true);
      const res = await appendMenuItem(
        accessToken,
        payload.data,
        payload.files
      );
      setFromBusiness(res);
      enqueueSnackbar("Plato agregado", { variant: "success" });
      setOpenNew(false);
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Error al agregar plato", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (index: number, payload: UpdatePayload) => {
    try {
      setLoading(true);

      const noData = !payload.data || Object.keys(payload.data).length === 0;
      const noFiles = payload.files.length === 0;
      const noDeletes =
        !payload.deletePhotoIndexes ||
        payload.deletePhotoIndexes.length === 0;

      if (noData && noFiles && noDeletes) {
        enqueueSnackbar("No hay cambios para guardar", { variant: "info" });
        return;
      }

      console.log("indices a borrar:", payload.deletePhotoIndexes);

      const res = await updateMenuItem(
        accessToken,
        index,
        payload.data,
        payload.files,
        payload.deletePhotoIndexes ?? []
      );

      setFromBusiness(res);
      enqueueSnackbar("Plato actualizado", { variant: "success" });
      setEditIndex(null);
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Error al actualizar plato", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index: number) => {
    try {
      setLoading(true);
      const res = await deleteMenuItem(accessToken, index);
      setFromBusiness(res);
      enqueueSnackbar("Plato eliminado", { variant: "success" });
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Error al eliminar plato", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // cuando el usuario hace click en el ícono de eliminar en la card
  const handleDeleteRequest = (index: number) => {
    if (loading) return;
    setToDeleteIndex(index);
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (loading) return; // mientras borra, no dejamos cerrar a clic
    setConfirmOpen(false);
    setToDeleteIndex(null);
  };

  const handleConfirmDelete = async () => {
    if (toDeleteIndex == null) return;
    await handleDelete(toDeleteIndex);
    setConfirmOpen(false);
    setToDeleteIndex(null);
  };

  const current = editIndex != null ? items[editIndex] : null;
  const toDeleteItem =
    toDeleteIndex != null ? items[toDeleteIndex] : undefined;

  return (
    <Box sx={{ position: "relative" }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Menú
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Agregá los detalles de tu menú como nombre, descripción y fotos
            atractivas para tus clientes.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setOpenNew(true)}
          disabled={loading}
        >
          Agregar plato
        </Button>
      </Stack>

      {/* Grid / vacío */}
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Aún no cargaste platos.
        </Typography>
      ) : (
        <RestaurantMenuGrid
          menu={items}
          restaurantType={(business as any)?.restaurantType}
          isOwner
          onEditItem={(i) => !loading && setEditIndex(i)}
          onDeleteItem={handleDeleteRequest}   // 👈 ahora abre el diálogo
        />
      )}

      {/* Alta */}
      <MenuEditorDialog
        open={openNew}
        onClose={() => setOpenNew(false)}
        onSubmit={handleCreate}
        title="Nuevo plato"
      />

      {/* Edición */}
      <MenuEditorDialog
        open={editIndex != null}
        onClose={() => setEditIndex(null)}
        initial={current ?? undefined}
        onSubmit={({ data, files, deletePhotoIndexes }) =>
          handleUpdate(editIndex!, { data, files, deletePhotoIndexes })
        }
        title="Editar plato"
      />

      {/* Diálogo de confirmación de borrado */}
      <Dialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar plato</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {toDeleteItem ? (
              <>
                ¿Seguro que querés eliminar{" "}
                <strong>{toDeleteItem.foodName}</strong>? Esta acción no se
                puede deshacer.
              </>
            ) : (
              "¿Seguro que querés eliminar este plato? Esta acción no se puede deshacer."
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={loading}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={loading}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading global */}
      <Backdrop
        open={loading}
        sx={{ color: "#fff", zIndex: (t) => t.zIndex.modal + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
