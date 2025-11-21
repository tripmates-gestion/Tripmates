import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton, Tooltip } from "@mui/material";

export function ShareProfileButton({ shareUrl }: { shareUrl: string }) {

  return (  

    <Tooltip title="Copiar link del perfil">
    <IconButton
        onClick={() => {
        navigator.clipboard.writeText(shareUrl);
        enqueueSnackbar("¡Link copiado al portapapeles!", { variant: "success" });
        }}
        sx={{
        ml: 1,
        bgcolor: "rgba(0,0,0,0.05)",
        "&:hover": {
            bgcolor: "rgba(0,0,0,0.1)"
        }
        }}
    >
        <ContentCopyIcon fontSize="small" />
    </IconButton>
    </Tooltip>
    );
}