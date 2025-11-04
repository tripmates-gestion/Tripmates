// BaseSearchBar.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  useTheme,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import type { SelectChangeEvent } from "@mui/material";

export interface CommonFilters {
  username?: string;
  location?: string;
  averagePrice?: "$" | "$$" | "$$$";
}

interface BaseSearchBarProps {
  onSearch: (filters: CommonFilters) => void;
  renderExtraFilters?: (closePopover: () => void) => React.ReactNode;
  loading?: boolean;
}

export const BaseSearchBar = ({
  onSearch,
  renderExtraFilters,
  loading = false,
}: BaseSearchBarProps) => {

  const theme = useTheme();
  const [filters, setFilters] = useState<CommonFilters>({});

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const handleOpenFilters = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleCloseFilters = () => setAnchorEl(null);

  const handleChangePrecio = (event: SelectChangeEvent<"$" | "$$" | "$$$" | "all">) => {
    if (event.target.value !== "all") {
      const value = event.target.value as "$" | "$$" | "$$$";
      setFilters((prev) => ({ ...prev, averagePrice: value }));
    }
  };

  return (
    <Box
      sx={{
        bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f7f7f7",
        borderRadius: "50px",
        p: 2,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Línea principal */}
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          placeholder="Ciudad"
          variant="outlined"
          size="small"
          value={filters.location}
          onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f7f7f7",
            borderRadius: "50px",
          }}
        />

        <TextField
          placeholder="Nombre"
          variant="outlined"
          size="small"
          value={filters.username}
          onChange={(e) => setFilters((prev) => ({ ...prev, username: e.target.value }))}
          sx={{
            flex: 1,
            bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f7f7f7",
            borderRadius: "50px",
          }}
        />

        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleOpenFilters}
          sx={{ borderRadius: "25px", textTransform: "none" }}
        >
          Filtros
        </Button>

        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          disabled={loading}
          onClick={() => onSearch(filters)}
          sx={{
            borderRadius: "25px",
            px: 4,
            fontWeight: "bold",
          }}
        >
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </Stack>

      {/* Popover de filtros */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseFilters}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            p: 3,
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            boxShadow: 6,
            minWidth: 320,
          },
        }}
      >
        <Stack spacing={2}>
          <FormControl size="small">
            <InputLabel id="precio-promedio-label">Precio promedio</InputLabel>
            <Select
              labelId="precio-promedio-label"
              value={filters.averagePrice ?? "all"}
              onChange={handleChangePrecio}
              input={
                <OutlinedInput
                  label="Precio promedio"
                  startAdornment={
                    <InputAdornment position="start">
                      <MonetizationOnIcon color="action" />
                    </InputAdornment>
                  }
                />
              }
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="$">$ (económico)</MenuItem>
              <MenuItem value="$$">$$ (medio)</MenuItem>
              <MenuItem value="$$$">$$$ (alto)</MenuItem>
            </Select>
          </FormControl>

          {/* Filtros adicionales pasados por el padre */}
          {renderExtraFilters && renderExtraFilters(handleCloseFilters)}
        </Stack>
      </Popover>
    </Box>
  );
};
