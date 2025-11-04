// src/components/hotel/HotelRoomsEditor.tsx
import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Backdrop,
  CircularProgress,
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

  const openCreate = () => {
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const openEdit = (idx: number) => {
    setEditingIndex(idx);
    setDialogOpen(true);
  };

  const handleDelete = async (idx: number) => {
    const ok = window.confirm("¿Eliminar este paquete de habitación?");
    if (!ok) return;

    try {
      setLoading(true);
      await deleteRoomPack(accessToken, idx);
      if (onBusinessReload) await onBusinessReload();
    } finally {
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const initialForDialog =
    editingIndex === null ? null : roomPacks[editingIndex] ?? null;

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, position: "relative" }}>
      <Backdrop open={loading} sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <CircularProgress />
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
        
        <Button variant="contained" onClick={openCreate}>
          Agregar paquete
        </Button>
      </Stack>

      {/* Grid de tarjetas, con acciones de editar/borrar */}
      <HotelRoomsCard
        roomPacks={roomPacks}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <RoomPackEditorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        initial={initialForDialog ?? undefined}
        title={
          editingIndex === null
            ? "Nuevo paquete de habitación"
            : "Editar paquete de habitación"
        }
      />
    </Box>
  );
}
