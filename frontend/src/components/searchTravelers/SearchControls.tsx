import React from "react";
import {
  Stack,
  Paper,
  TextField,
  InputAdornment,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

interface Props {
  bgColor: string;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  searchType: "name" | "location";
  setSearchType: (v: "name" | "location") => void;
  onSearch: () => void;
}

const SearchControls: React.FC<Props> = ({
  bgColor,
  searchTerm,
  setSearchTerm,
  searchType,
  setSearchType,
  onSearch,
}) => (
  <>
    <Paper
      elevation={3}
      sx={{
        width: "90%",
        maxWidth: 900,
        p: 4,
        borderRadius: 4,
        backgroundColor: bgColor,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      }}
    >
      <Stack spacing={3}>
        <Stack direction="column" alignItems="center" spacing={1}>
          <ToggleButtonGroup
            value={searchType}
            exclusive
            onChange={(_, newType) => newType && setSearchType(newType)}
            aria-label="search type"
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: 2,
                px: 3,
                py: 1,
                color: "text.primary",
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                },
              },
            }}
          >
            <ToggleButton value="name">
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonSearchIcon />
                <Typography fontWeight="600">Por Nombre</Typography>
              </Stack>
            </ToggleButton>
            <ToggleButton value="location">
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnIcon />
                <Typography fontWeight="600">Por Ubicación</Typography>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, height: 20 }}>
            {searchType === "location"
              ? "Encuentra viajeros que han estado en una ubicación específica."
              : "Busca viajeros por su nombre de usuario o nombre real."}
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={
              searchType === "name"
                ? "Ej: Ana Pérez, Dana Fernandez"
                : "Ej: Cusco, Perú; Bariloche, Argentina"
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                  borderWidth: 2,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={onSearch}
            size="large"
            sx={{
              borderRadius: 2,
              minWidth: 120,
              boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
              fontWeight: "bold"
            }}
          >
            Buscar
          </Button>
        </Stack>
      </Stack>
    </Paper>
  </>
);

export default SearchControls;
