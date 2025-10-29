// ──────────────────────────────────────────────────────────────────────────────
// components/places/PlaceGrid.tsx
// ──────────────────────────────────────────────────────────────────────────────
import * as React from "react";
import { Grid } from "@mui/material";
import PlaceCard from "./PlaceCard";
import type { BusinessPlaceDTO } from "../../types/place";
import { PlaceDetailDialog } from "./PlaceDetailDialog";

type Props = {
  places: BusinessPlaceDTO[];
};

export default function PlaceGrid({ places }: { places: BusinessPlaceDTO[] }) {
  const [selected, setSelected] = React.useState<BusinessPlaceDTO | null>(null);

  return (
    <>
      <Grid container spacing={3}>
        {places.map((p, idx) => (
          <Grid key={p.id ?? idx} item xs={12} sm={6} md={6}>
            <PlaceCard place={p} onView={setSelected} />
          </Grid>
        ))}
      </Grid>

      <PlaceDetailDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        place={selected}
      />
    </>
  );
}