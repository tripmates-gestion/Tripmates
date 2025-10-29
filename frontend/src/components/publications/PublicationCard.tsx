// src/components/publications/PublicationCard.tsx
import {
  Card, CardMedia, CardContent, Typography, Stack, Box, IconButton, Menu, MenuItem
} from "@mui/material"
import { MoreVert } from "@mui/icons-material"
import { useState, type MouseEvent } from "react"
import type { BusinessPublicationResponseDTO } from "../../types/business"

type Props = {
  publication: BusinessPublicationResponseDTO
  onView: (p: BusinessPublicationResponseDTO) => void
  onEdit?: (p: BusinessPublicationResponseDTO) => void
  onDelete?: (id: string) => void
}

export default function PublicationCard({ publication, onView, onEdit, onDelete }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleMenu = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)
  
  return (
    <Card
      onClick={() => onView(publication)}
      sx={{
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": { boxShadow: 4, transform: "translateY(-2px)" }
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="180"
          image={
            publication.imageUrls?.[0] !== undefined && 
            publication.imageUrls[0] !== null && 
            publication.imageUrls[0] !== '' 
              ? publication.imageUrls[0] 
              : "/logo.png"
          }
          alt={publication.title}
        />
        <IconButton
          onClick={(e) => { e.stopPropagation(); handleMenu(e) }}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            bgcolor: "rgba(255,255,255,0.8)",
            "&:hover": { bgcolor: "white" }
          }}
        >
          <MoreVert />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          {onEdit && <MenuItem onClick={() => { handleClose(); onEdit(publication) }}>Editar</MenuItem>}
          {onDelete && <MenuItem onClick={() => { handleClose(); onDelete(publication.id!) }}>Eliminar</MenuItem>}
        </Menu>
      </Box>

      <CardContent>
        <Typography variant="h6" fontWeight={700}>{publication.title}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {publication.description}
        </Typography>
        <Stack spacing={0.3} mt={1}>
          <Typography variant="caption" color="text.secondary">
            📍 {publication.location}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ☎ {publication.phoneNumber || publication.email}
          </Typography>
          {publication.attentionSchedule && (
            <Typography variant="caption" color="text.secondary">
              🕘 {publication.attentionSchedule.openingTime}–{publication.attentionSchedule.closingTime}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
