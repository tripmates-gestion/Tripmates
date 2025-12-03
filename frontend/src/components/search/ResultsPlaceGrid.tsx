// ──────────────────────────────────────────────────────────────────────────────
// components/places/PlaceGrid.tsx
// ──────────────────────────────────────────────────────────────────────────────
import { Box, Grid } from "@mui/material";
import PlaceCard from "./ResultPlaceCard";
import type { BusinessPubAccountDataDTO } from "../../types/AccountData";

type Props = {
  businessAccounts: BusinessPubAccountDataDTO[];
};

export default function PlaceGrid({ businessAccounts }: Props) {
  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, pb: 4, width: "100%" }}>
      <Grid container spacing={3} alignItems="stretch">
        {businessAccounts.map((p, idx) => (
          <Grid
            key={p.id ?? idx}
            item
            xs={12}
            sm={6}
            md={6}
            sx={{ display: "flex" }}
          >
            <PlaceCard businessAccountData={p} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
