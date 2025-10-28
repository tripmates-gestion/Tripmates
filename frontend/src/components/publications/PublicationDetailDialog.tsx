import {
    Dialog, DialogContent, DialogTitle, Box, Typography,
    IconButton, Stack
  } from "@mui/material"
  import { Close, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material"
  import { useState } from "react"
  import type { BusinessPublicationResponseDTO } from "../../types/business"
  
  type Props = {
    open: boolean
    onClose: () => void
    publication: BusinessPublicationResponseDTO | null
  }
  
  export default function PublicationDetailDialog({ open, onClose, publication }: Props) {
    const [index, setIndex] = useState(0)
    if (!publication) return null
  
    const next = () => setIndex((i) => (i + 1) % publication.imageUrls.length)
    const prev = () => setIndex((i) => (i - 1 + publication.imageUrls.length) % publication.imageUrls.length)
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box component="span" fontWeight={700}>{publication.title}</Box>
        <IconButton onClick={onClose}><Close /></IconButton>
      </DialogTitle>

        <DialogContent>
          <Box sx={{ position: "relative" }}>
            <img
              src={publication.imageUrls[index] || "/placeholder.jpg"}
              alt={publication.title}
              style={{ width: "100%", borderRadius: 8, objectFit: "cover", height: 400 }}
            />
            {publication.imageUrls.length > 1 && (
              <>
                <IconButton onClick={prev} sx={{ position: "absolute", left: 8, top: "45%", color: "white" }}>
                  <ArrowBackIos />
                </IconButton>
                <IconButton onClick={next} sx={{ position: "absolute", right: 8, top: "45%", color: "white" }}>
                  <ArrowForwardIos />
                </IconButton>
              </>
            )}
          </Box>
  
          <Stack spacing={1.2} mt={2}>
            <Typography variant="body1">{publication.description}</Typography>
            <Typography variant="body2" color="text.secondary">
              📍 {publication.location}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ☎ {publication.phoneNumber || publication.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              🕘 {publication.attentionSchedule.openingTime}–{publication.attentionSchedule.closingTime}
            </Typography>
          </Stack>
  
          {/* Placeholder para futuras reseñas */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={700}>Reseñas</Typography>
            <Typography variant="body2" color="text.secondary">
              Las reseñas estarán disponibles próximamente.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }
  