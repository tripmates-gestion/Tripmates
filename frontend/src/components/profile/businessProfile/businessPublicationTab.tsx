/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from "@mui/material";
import type { BusinessPublicationResponseDTO } from "../../../types/business";
import { getBusinessPublications, deleteBusinessPublication} from "../../../services/businessPublications";
import PublicationGrid from '../../publications/PublicationGrid';
import React from "react";
import {Box, Button, Stack} from '@mui/material';
import {EmptyState} from '../EmptyState';

export function BusinessPublicationsTab({ token }: { token: string | null }) {
    const [items, setItems] = React.useState<BusinessPublicationResponseDTO[]>([])
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
  
    const fetchAll = React.useCallback(async () => {
      if (!token) {
        setError("No estás autenticado.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
  
      const controller = new AbortController();
      try {
        const res = await getBusinessPublications(token);
        console.log("[BusinessPublicationsTab] Publicaciones obtenidas:", res);
        setItems(res ?? []);
      } catch (e: any) {
        setError(e?.message || "Error al obtener publicaciones");
      } finally {
        setLoading(false);
      }
      return () => controller.abort();
    }, [token]);
  
    React.useEffect(() => { fetchAll() }, [])
  
    // ✅ Handler de eliminación
    const handleDelete = async (id: string) => {
      if (!token) return
      if (!confirm("¿Seguro que querés eliminar esta publicación?")) return
  
      try {
        await deleteBusinessPublication(token, id)
        setItems(prev => prev.filter(p => p.id !== id))
      } catch (e: any) {
        alert(e.message || "Error al eliminar publicación")
      }
    }
  
    if (loading) return <p>Cargando publicaciones...</p>
    if (error) {
      return (
        <Stack spacing={2}>
          <Alert severity="error">{error}</Alert>
          <Button onClick={fetchAll}>Reintentar</Button>
        </Stack>
      )
    }
  
    return (
      <>
        {items.length === 0 && <EmptyState title="No hay publicaciones" />}
        <Box>
          <PublicationGrid publications={items ?? []} onDelete={handleDelete} />
        </Box>
      </>
    )
  }