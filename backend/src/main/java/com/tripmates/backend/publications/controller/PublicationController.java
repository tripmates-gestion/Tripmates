package com.tripmates.backend.publications.controller;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import com.tripmates.backend.publications.service.PublicationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripmates.backend.publications.dto.BusinessPublicationRequestDTO;
import java.util.List;
import com.tripmates.backend.common.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
@RestController
@RequestMapping("/publications")
@Tag(name = "Publications", description = "Publication management endpoints (services, hostings, etc.)")
public class PublicationController {

    @Autowired
    private PublicationService publicationService;

    @Autowired
    private ObjectMapper mapper;

    @PostMapping(value = "/business", consumes = "multipart/form-data")
    @io.swagger.v3.oas.annotations.Operation(
        summary = "Create a new business publication",
        description = "Crea una nueva publicación de negocio con los datos proporcionados e imágenes opcionales.\n\n" +
                    "**Estructura de la petición multipart:**\n" +
                    "- `data`: (obligatorio) JSON con los datos de la publicación.\n" +
                    "- `files`: (opcional) Archivos de imágenes para la publicación (JPG, PNG, etc.)\n\n" +
                    "**Ejemplo de JSON para el campo 'data':**\n" +
                    "```json\n" +
                    "{\n" +
                    "  \"title\": \"Hospedaje en la montaña\",\n" +
                    "  \"description\": \"Hermoso lugar con vistas increíbles y comodidades completas.\",\n" +
                    "  \"phoneNumber\": \"+541112345678\",\n" +
                    "  \"email\": \"contacto@hostal.com\",\n" +
                    "  \"location\": \"San Carlos de Bariloche, Argentina\",\n" +
                    "  \"openingDays\": [\"MONDAY\", \"TUESDAY\", \"WEDNESDAY\", \"THURSDAY\", \"FRIDAY\"],\n" +
                    "  \"attentionSchedule\": {\n" +
                    "    \"openingTime\": \"09:00\",\n" +
                    "    \"closingTime\": \"18:00\"\n" +
                    "  },\n" +
                    "  \"exceptionalClosingDays\": [\"2025-12-25\", \"2025-01-01\"]\n" +
                    "}\n" +
                    "```"
    )
    public ResponseEntity<?> uploadBusinessPublication(
            @Parameter(description = "JSON con los datos de la publicación. Debe incluir: título, descripción, teléfono, email, ubicación, días de apertura, horario de atención y días de cierre excepcionales.")
            @RequestPart("data") String data,
            @Parameter(description = "Archivos de imágenes para la publicación (opcional). Formatos soportados: JPG, PNG, etc.")
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserDetails userDetails
    ){
      try{
        BusinessPublicationRequestDTO publication = mapper.readValue(data, BusinessPublicationRequestDTO.class);
        return ResponseEntity.ok().body(publicationService.createBusinessPublication(publication, files, userDetails.getUsername()));
      }catch(Exception e){
        throw new BadRequestException("Error al parsear el JSON: " + e.getMessage());
      }
    }
    @GetMapping("/mine")
    @io.swagger.v3.oas.annotations.Operation(
        summary = "List my publications",
        description = "Devuelve todas las publicaciones del usuario autenticado."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Listado obtenido correctamente")
    })
    public ResponseEntity<?> listMyPublications(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(publicationService.listMyPublications(userDetails.getUsername()));
    }

    @PatchMapping(value = "/{id}", consumes = "multipart/form-data")
    @io.swagger.v3.oas.annotations.Operation(
        summary = "Update a publication",
        description = "Actualiza una publicación existente con datos en JSON e imágenes opcionales.\n\n"
                    + "Estructura de la petición multipart:\n"
                    + "- `data`: (obligatorio) JSON con los campos a modificar.\n"
                    + "- `files`: (opcional) Imágenes para la publicación (JPG, PNG, etc.).\n\n"
                    + "Ejemplo de JSON para el campo 'data':\n"
                    + "```json\n"
                    + "{\n"
                    + "  \"title\": \"Nuevo título\",\n"
                    + "  \"description\": \"Descripción actualizada\",\n"
                    + "  \"phoneNumber\": \"+541112345678\",\n"
                    + "  \"email\": \"contacto@hostal.com\",\n"
                    + "  \"location\": \"Dirección 123, Ciudad\",\n"
                    + "  \"openingDays\": [\"MONDAY\", \"TUESDAY\"],\n"
                    + "  \"attentionSchedule\": { \"openingTime\": \"09:00\", \"closingTime\": \"18:00\" },\n"
                    + "  \"exceptionalClosingDays\": [\"2025-12-25\"]\n"
                    + "}\n"
                    + "```"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Publicación actualizada correctamente",
            content = @io.swagger.v3.oas.annotations.media.Content(
                mediaType = "application/json",
                schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = com.tripmates.backend.publications.dto.BusinessPublicationResponseDTO.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Solicitud inválida")
    })
    public ResponseEntity<?> updateBusinessPublication(
            @PathVariable("id") String id,
            @RequestPart("data") String data,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserDetails userDetails
    ){
      try{
        BusinessPublicationRequestDTO dto = mapper.readValue(data, BusinessPublicationRequestDTO.class);
        return ResponseEntity.ok().body(
            publicationService.updatePublication(id, dto, files, userDetails.getUsername())
        );
      }catch(Exception e){
        throw new BadRequestException("Error al parsear el JSON: " + e.getMessage());
      }
    }

    @GetMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(
        summary = "Get my publication",
        description = "Obtiene una publicación por id, solo si pertenece al usuario autenticado."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Publicación obtenida correctamente",
            content = @io.swagger.v3.oas.annotations.media.Content(
                mediaType = "application/json",
                schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = com.tripmates.backend.publications.dto.BusinessPublicationResponseDTO.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "No existe o no pertenece al usuario")
    })
    public ResponseEntity<?> getMyPublication(
        @PathVariable("id") String id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(publicationService.getMyPublication(id, userDetails.getUsername()));
    }

}
