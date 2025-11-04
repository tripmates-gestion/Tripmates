// src/components/hotel/HotelRoomsEditor.tsx
import { useState } from "react";
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
import type { RoomPack } from "../../../../types/Hotel";
import {
  appendRoomPack,
  updateRoomPack,
  deleteRoomPack,
} from "../../../../services/hotelRoomPacks";
import { RoomPackEditorDialog } from "./RoomPackDialog";
import { HotelRoomsCard } from "./HotelUserRoomsCard";

type Props = {
  accessToken: string;
  roomPacks: RoomPack[];
  onBusinessReload?: () => void | Promise<void>;
};

export default function HotelRoomsTab({
  accessToken,
  roomPacks,
  onBusinessReload,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // diálogo de confirmación de borrado
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteIndex, setToDeleteIndex] = useState<number | null>(null);

  const openCreate = () => {
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const openEdit = (idx: number) => {
    setEditingIndex(idx);
    setDialogOpen(true);
  };

  // antes borrabas directo; ahora solo abre el diálogo
  const handleDeleteRequest = (idx: number) => {
    if (loading) return;
    setToDeleteIndex(idx);
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    if (loading) return;
    setConfirmOpen(false);
    setToDeleteIndex(null);
  };

  const handleConfirmDelete = async () => {
    if (toDeleteIndex == null) return;
    try {
      setLoading(true);
      await deleteRoomPack(accessToken, toDeleteIndex);
      if (onBusinessReload) await onBusinessReload();
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setToDeleteIndex(null);
    }
  };

  const handleSubmit = async (payload: {
    data: RoomPack;
    files: File[];
    deletePhotoIndexes?: number[];
  }) => {
    try {
      setLoading(true);
      if (editingIndex === null) {
        await appendRoomPack(accessToken, payload.data, payload.files);
      } else {
        await updateRoomPack(
          accessToken,
          editingIndex,
          payload.data,
          payload.files,
          payload.deletePhotoIndexes ?? []
        );
      }
      if (onBusinessReload) await onBusinessReload();
      setDialogOpen(false);
      setEditingIndex(null);
    } finally {
      setLoading(false);
    }
  };

  const initialForDialog =
    editingIndex === null ? null : roomPacks[editingIndex] ?? null;

  const toDeletePack =
    toDeleteIndex == null ? undefined : roomPacks[toDeleteIndex];

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, position: "relative" }}>
      {/* Loading global */}
      <Backdrop
        open={loading}
        sx={{ color: "#fff", zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Paquetes de habitaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configurá las fechas, capacidad, servicios, precio y fotos de tus
            paquetes de alojamiento.
          </Typography>
        </Box>

        <Button variant="contained" onClick={openCreate} disabled={loading}>
          Agregar paquete
        </Button>
      </Stack>

      {/* Grid de tarjetas, con acciones de editar/borrar */}
      <HotelRoomsCard
        roomPacks={roomPacks}
        onEdit={openEdit}
        onDelete={handleDeleteRequest}  // 👈 ahora abre el diálogo
      />

      <RoomPackEditorDialog
        open={dialogOpen}
        onClose={() => !loading && setDialogOpen(false)}
        onSubmit={handleSubmit}
        initial={initialForDialog ?? undefined}
        title={
          editingIndex === null
            ? "Nuevo paquete de habitación"
            : "Editar paquete de habitación"
        }
      />

      {/* Diálogo de confirmación de borrado */}
      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar paquete</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {toDeletePack ? (
              <>
                ¿Seguro que querés eliminar el paquete{" "}
                <strong>{toDeletePack.description ?? "sin descripción"}</strong>
                ? Esta acción no se puede deshacer.
              </>
            ) : (
              "¿Seguro que querés eliminar este paquete? Esta acción no se puede deshacer."
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} disabled={loading}>
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
