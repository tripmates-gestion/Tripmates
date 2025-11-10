import React from "react";
import {
  Box,
  Stack,
  Chip,
  Paper,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

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
    <Stack direction="row" justifyContent="center" spacing={2} mb={2}>
      <Chip
        label="Por nombre"
        color="primary"
        variant={searchType === "name" ? "filled" : "outlined"}
        onClick={() => setSearchType("name")}
        sx={{ fontWeight: searchType === "name" ? 600 : 400 }}
      />
      <Chip
        label="Por ubicación"
        color="primary"
        variant={searchType === "location" ? "filled" : "outlined"}
        onClick={() => setSearchType("location")}
        sx={{ fontWeight: searchType === "location" ? 600 : 400 }}
      />
    </Stack>

    <Paper
      sx={{
        width: "90%",
        maxWidth: 900,
        p: 3,
        borderRadius: 2,
        backgroundColor: bgColor,
      }}
    >
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={onSearch}
          sx={{ borderRadius: 2, minWidth: 120 }}
        >
          Buscar
        </Button>
      </Stack>

      {searchTerm && (
        <Box mt={2}>
          <Chip label={`Filtro: "${searchTerm}"`} variant="outlined" color="primary" />
        </Box>
      )}
    </Paper>
  </>
);

export default SearchControls;
