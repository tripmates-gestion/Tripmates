package com.tripmates.backend.publications.controller;
import io.swagger.v3.oas.annotations.tags.Tag;
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
    public ResponseEntity<?> uploadBusinessPublication(
            @RequestPart("data") String data,
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

}
