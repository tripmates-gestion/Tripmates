import * as React from "react";
import {
  Box, Button, Stack, Typography, Backdrop, CircularProgress
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

export default function RestaurantMenuTab({
  accessToken,
  initialMenu,
  onBusinessReload,
}: Props) {
  const [items, setItems] = React.useState<MenuItem[]>(initialMenu ?? []);
  const [openNew, setOpenNew] = React.useState(false);
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { business } = useBusinessProfile();

  React.useEffect(() => {
    setItems(initialMenu ?? []);
  }, [initialMenu]);

  const setFromBusiness = (res: any) => {
    // el back devuelve el Business completo
    setItems(res?.menu ?? res?.menuItems ?? []);
    onBusinessReload?.(res);
  };

  const handleCreate = async (payload: {
    data: Omit<MenuItem, "photosURLs">;
    files: File[];
  }) => {
    try {
      setLoading(true);
      const res = await appendMenuItem(accessToken, payload.data, payload.files);
      setFromBusiness(res);
      enqueueSnackbar("Plato agregado", { variant: "success" });
      setOpenNew(false);
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Error al agregar plato", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (
    index: number,
    payload: { data: Partial<Omit<MenuItem, "photosURLs">>; files: File[] }
  ) => {
    try {
      setLoading(true);

      // ⚠️ Si no hay nuevas fotos, mandamos las actuales para conservarlas
      const current = items[index];
      const currentPhotos = payload.files.length === 0
        ? current?.photosURLs ?? []
        : current?.photosURLs ?? []; // igual las paso: el back hace append

      const res = await updateMenuItem(
        accessToken,
        index,
        payload.data,
        payload.files,
        currentPhotos // <- clave
      );

      setFromBusiness(res);
      enqueueSnackbar("Plato actualizado", { variant: "success" });
      setEditIndex(null);
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Error al actualizar plato", { variant: "error" });
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
      enqueueSnackbar(e?.message || "Error al eliminar plato", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const current = editIndex != null ? items[editIndex] : null;

  return (
    <Box sx={{ position: "relative" }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>Menú</Typography>
        <Button variant="contained" onClick={() => setOpenNew(true)} disabled={loading}>
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
          onDeleteItem={(i) => !loading && handleDelete(i)}
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
        onSubmit={({ data, files }) => handleUpdate(editIndex!, { data, files })}
        title="Editar plato"
      />

      {/* Loading global */}
      <Backdrop open={loading} sx={{ color: "#fff", zIndex: (t) => t.zIndex.modal + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
