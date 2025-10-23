// src/components/SearchBar.tsx
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

// Barra de búsqueda reutilizable (formulario con input y botón)
export default function SearchBar({
    placeholder = 'Buscar destinos, lugares…', // texto por defecto del input
    onSubmit,                                  // función que se ejecuta al enviar
  }: {
    placeholder?: string;
    onSubmit?: (q: string) => void;
  }) {
    return (
      // Paper = contenedor con estilo de tarjeta
      <Paper
        component="form"
        onSubmit={(e) => {
          e.preventDefault(); // evita recargar la página
          const q = new FormData(e.currentTarget).get('q')?.toString() || '';
          onSubmit?.(q); // llama a la función pasada con el texto buscado
        }}
        sx={{
          p: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          maxWidth: 600,
          width: '100%',
          borderRadius: 999, // bordes redondeados estilo pill
        }}
        elevation={3} // sombra ligera
      >
        {/* Campo de texto donde el usuario escribe */}
        <InputBase
          name="q"
          sx={{ ml: 1, flex: 1 }}
          placeholder={placeholder}
        />
        {/* Botón con ícono de búsqueda */}
        <IconButton type="submit" aria-label="buscar">
          <SearchIcon /> 
        </IconButton>
      </Paper>
    );
  }
  