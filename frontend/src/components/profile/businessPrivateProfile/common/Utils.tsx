import { Box, IconButton, Stack, Typography } from "@mui/material";
import { DeleteOutline, CloudUpload } from "@mui/icons-material";


// dataURL (base64) -> File
export function dataURLtoFile(dataUrl: string, filename: string) {
  const arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}


type NewImagesDropzoneProps = {
  label?: string;
  previews: string[];
  error?: string;
  onFilesSelected: (files: FileList | File[]) => void;
  onRemoveAt: (index: number) => void;
};

export function NewImagesDropzone({
  label = "Imágenes nuevas",
  previews,
  error,
  onFilesSelected,
  onRemoveAt,
}: NewImagesDropzoneProps) {
  const handleFiles = (files?: FileList | File[]) => {
    if (!files) return;
    onFilesSelected(files);
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={700}>
        {label}
      </Typography>

      <Box
        sx={(t) => ({
          width: "100%",
          minHeight: 140,
          borderRadius: 2,
          border: "2px dashed",
          borderColor: "divider",
          display: "grid",
          placeItems: "center",
          position: "relative",
          bgcolor: t.palette.background.default,
          cursor: "pointer",
        })}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Stack
          alignItems="center"
          spacing={0.5}
          sx={{ pointerEvents: "none" }}
        >
          <CloudUpload color="action" />
          <Typography variant="body2" color="text.secondary">
            Arrastrá o hacé click para subir (podés elegir varias)
          </Typography>
        </Stack>

        <input
          type="file"
          accept="image/*"
          multiple
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "pointer",
          }}
          onChange={(e) => handleFiles(e.target.files ?? undefined)}
        />
      </Box>

      {!!error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}

      {previews.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Nuevas ({previews.length})
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
              gap: 1,
            }}
          >
            {previews.map((src, i) => (
              <Box
                key={i}
                sx={{
                  position: "relative",
                  borderRadius: 1,
                  overflow: "hidden",
                  boxShadow: 1,
                  height: 90,
                  backgroundImage: `url(${src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => onRemoveAt(i)}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: "rgba(255,255,255,0.9)",
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Stack>
      )}
    </Stack>
  );
}