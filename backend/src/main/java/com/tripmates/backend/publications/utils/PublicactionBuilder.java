package com.tripmates.backend.publications.utils;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import com.tripmates.backend.publications.dto.BusinessPublicationRequestDTO;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.common.exception.BadRequestException;

public class PublicactionBuilder {
    private BusinessPublicationRequestDTO businessPublicationDTO;
    private List<String> imageUrls = new ArrayList<>();
    private User owner;
    private StorageService storageService;

    public PublicactionBuilder(StorageService storageService) {
        this.storageService = storageService;
    }

    public PublicactionBuilder publicationDetails(BusinessPublicationRequestDTO businessPublicationDTO) {
        this.businessPublicationDTO = businessPublicationDTO;
        return this;
    }

    public PublicactionBuilder imageFiles(List<MultipartFile> imageFiles) {
        for (MultipartFile imageFile : imageFiles) {
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = storageService.uploadFile(imageFile);
                imageUrls.add(imageUrl);
            }else{
                throw new BadRequestException("Se proporcionó un archivo de imagen vacío o una lista vacía de archivos de imagen.");
            }
        }
        return this;
    }

    public PublicactionBuilder owner(User owner) {
        this.owner = owner;
        return this;
    }

    public Publication build() {

        return new Publication(
            businessPublicationDTO.title(),
            businessPublicationDTO.type(),
            businessPublicationDTO.description(),
            businessPublicationDTO.openingDays(),
            businessPublicationDTO.attentionSchedule(),
            businessPublicationDTO.exceptionalClosingDays(),
            businessPublicationDTO.phoneNumber(),
            businessPublicationDTO.email(),
            businessPublicationDTO.location(),
            imageUrls,
            owner.getId(),
            owner.getName(),
            owner.getAvatarURL(),
            new Date()
        );
    }
}
