import { useState } from 'react'
import { Button } from '@mui/material'
import { NewPostDialog } from './NewPostDialog'

// ---------------------- Componente Principal ----------------------

type PublishButtonWithDialogProps = {
  visible: boolean
}

/**
 * Botón que abre el diálogo para crear una nueva publicación de negocio
 */
export default function PublishButtonWithDialog({ visible }: PublishButtonWithDialogProps) {
  const [open, setOpen] = useState(false)

  if (!visible) return null

  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const handleCreated = () => {
    // El NewPostDialog ya maneja el cierre y los toasts
    closeModal()
  }

  return (
    <>
      <Button variant="contained" onClick={openModal}>
        Publicar
      </Button>
      <NewPostDialog open={open} onClose={closeModal} onCreated={handleCreated} />
    </>
  )
}