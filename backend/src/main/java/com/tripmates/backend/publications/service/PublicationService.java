package com.tripmates.backend.publications.service;

import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.publications.dto.BusinessPublicationRequestDTO;
import com.tripmates.backend.publications.repository.PublicationRepository;
import com.tripmates.backend.users.repository.mongo.UserRepository;
import com.tripmates.backend.utils.PublicactionBuilder;
import com.tripmates.backend.users.entity.mongo.User;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.publications.dto.BusinessPublicationResponseDTO;
import com.tripmates.backend.publications.entity.mongo.Publication;
import java.util.ArrayList;

@Component
@Transactional
@Service
public class PublicationService {
    @Autowired
    private PublicationRepository publicationRepository;
    @Autowired
    private StorageService storageService;
    @Autowired
    private UserRepository userRepository;

    public BusinessPublicationResponseDTO createBusinessPublication(
            BusinessPublicationRequestDTO businessPublicationDTO,
            List<MultipartFile> imageFiles,
            String authenticatedUserEmail) {

        User user = userRepository.findByEmail(authenticatedUserEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        var publicationConstructor = new PublicactionBuilder(storageService)
                .publicationDetails(businessPublicationDTO)
                .owner(user);

        if (imageFiles != null) {
            publicationConstructor = publicationConstructor.imageFiles(imageFiles);
        }
        Publication savedPublication = publicationRepository.save(publicationConstructor.build());
        return BusinessPublicationResponseDTO.fromPublication(savedPublication);
    }

    public void deletePublication(String id, String authenticatedUserEmail) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Publication not found"));
        User user = userRepository.findByEmail(authenticatedUserEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (publication.getOwnerId() != null && !publication.getOwnerId().equals(user.getId())) {
            throw new BadRequestException("You are not allowed to delete this publication");
        }
        if (publication.getImageUrls() != null) {
            for (String url : publication.getImageUrls()) {
                if (url != null && !url.isBlank()) {
                    storageService.deleteByUrl(url);
                }
            }
        }
        publicationRepository.deleteById(id);
    }

    public java.util.List<BusinessPublicationResponseDTO> listMyPublications(String authenticatedUserEmail) {
        User user = userRepository.findByEmail(authenticatedUserEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        java.util.List<Publication> pubs = publicationRepository.findByOwnerId(user.getId());
        java.util.List<BusinessPublicationResponseDTO> out = new java.util.ArrayList<>();
        for (Publication p : pubs) {
            out.add(BusinessPublicationResponseDTO.fromPublication(p));
        }
        return out;
    }

    public BusinessPublicationResponseDTO getMyPublication(String id, String authenticatedUserEmail) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Publication not found"));
        User user = userRepository.findByEmail(authenticatedUserEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (publication.getOwnerId() != null && !publication.getOwnerId().equals(user.getId())) {
            throw new BadRequestException("You are not allowed to access this publication");
        }
        return BusinessPublicationResponseDTO.fromPublication(publication);
    }

    public BusinessPublicationResponseDTO updatePublication(
            String id,
            BusinessPublicationRequestDTO dto,
            List<MultipartFile> imageFiles,
            String authenticatedUserEmail) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Publication not found"));

        User user = userRepository.findByEmail(authenticatedUserEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (publication.getOwnerId() != null && !publication.getOwnerId().equals(user.getId())) {
            throw new BadRequestException("You are not allowed to update this publication");
        }

        if (dto.title() != null)
            publication.setTitle(dto.title());
        if (dto.description() != null)
            publication.setDescription(dto.description());
        if (dto.phoneNumber() != null)
            publication.setPhoneNumber(dto.phoneNumber());
        if (dto.email() != null)
            publication.setEmail(dto.email());
        if (dto.location() != null)
            publication.setLocation(dto.location());
        if (dto.openingDays() != null)
            publication.setOpeningDays(dto.openingDays());
        if (dto.attentionSchedule() != null)
            publication.setAttentionSchedule(dto.attentionSchedule());
        if (dto.exceptionalClosingDays() != null)
            publication.setExceptionalClosingDays(dto.exceptionalClosingDays());

        if (imageFiles != null && !imageFiles.isEmpty()) {
            // delete previous images if any
            if (publication.getImageUrls() != null) {
                for (String oldUrl : publication.getImageUrls()) {
                    if (oldUrl != null && !oldUrl.isBlank()) {
                        storageService.deleteByUrl(oldUrl);
                    }
                }
            }
            ArrayList<String> urls = new ArrayList<>();
            for (MultipartFile file : imageFiles) {
                String url = storageService.uploadFile(file);
                urls.add(url);
            }
            publication.setImageUrls(urls);
        }

        publicationRepository.save(publication);
        return BusinessPublicationResponseDTO.fromPublication(publication);
    }
}
