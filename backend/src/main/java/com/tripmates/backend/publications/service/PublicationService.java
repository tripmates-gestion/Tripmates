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

import com.tripmates.backend.publications.dto.BusinessPublicationResponseDTO;
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


    public BusinessPublicationResponseDTO createBusinessPublication
    (
        BusinessPublicationRequestDTO businessPublicationDTO,
        List<MultipartFile> imageFiles,
        String authenticatedUserEmail
    ) {

        User user = userRepository.findByEmail(authenticatedUserEmail)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
            
        var publicationConstructor = new PublicactionBuilder(storageService)
            .publicationDetails(businessPublicationDTO)
            .owner(user);

        if(imageFiles != null){
            publicationConstructor=publicationConstructor.imageFiles(imageFiles);
        }
        var publication = publicationConstructor.build();
  
        publicationRepository.save(publication);
        return BusinessPublicationResponseDTO.fromPublication(publication);
    }
}
