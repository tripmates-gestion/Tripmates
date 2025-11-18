package com.tripmates.backend.community.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;

@Service
@Transactional
public class CommunityService {
  private final PublicationRepository publicationRepository;

  public CommunityService(PublicationRepository publicationRepository) {
    this.publicationRepository = publicationRepository;
  }

  public void inviteUserToPlan(Long planId, Long userId) {
  }
  
  private PublicationRepository checkMyExistentPlan(Long planId) {
    return publicationRepository;
  }
}
