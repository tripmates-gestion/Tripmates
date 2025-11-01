// ──────────────────────────────────────────────────────────────────────────────
// components/places/PlaceGrid.tsx
// ──────────────────────────────────────────────────────────────────────────────
import { Grid } from "@mui/material";
import PlaceCard from "./PlaceCard";
import type { BusinessPubAccountDataDTO } from "../../types/AccountData";

type Props = {
  businessAccounts: BusinessPubAccountDataDTO[];
};

export default function PlaceGrid({ businessAccounts }: Props) {
  // const [selected, setSelected] = React.useState<BusinessPlaceDTO | null>(null);

  return (
    <>
      <Grid container spacing={3}>
        {businessAccounts.map((p, idx) => (
          <Grid key={p.id ?? idx} item xs={12} sm={6} md={6}>
            <PlaceCard businessAccountData={p} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}