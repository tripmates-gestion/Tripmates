// src/components/publications/PublicationGrid.tsx
import { Grid } from "@mui/material"
import { useState } from "react"
import PublicationCard from "./PublicationCard"
import PublicationDetailDialog from "./PublicationDetailDialog"
import type { BusinessPublicationResponseDTO } from "../../types/business"

type Props = {
  publications: BusinessPublicationResponseDTO[]
  onEdit?: (p: BusinessPublicationResponseDTO) => void
  onDelete?: (id: string) => void
}

export default function PublicationGrid({ publications, onEdit, onDelete }: Props) {
  const [selected, setSelected] = useState<BusinessPublicationResponseDTO | null>(null)

  return (
    <>
      <Grid container spacing={3}>
        {publications.map((p) => (
          <Grid key={p.id} item xs={12} sm={6} md={4}>
            <PublicationCard
              publication={p}
              onView={setSelected}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Grid>
        ))}
      </Grid>

      <PublicationDetailDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        publication={selected}
      />
    </>
  )
}
