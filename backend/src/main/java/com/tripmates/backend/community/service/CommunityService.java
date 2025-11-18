package com.tripmates.backend.community.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.exception.NotFoundException;
import com.tripmates.backend.common.exception.UnauthorizedException;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.users.dto.plan.PlanWithPublicationsResponseDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.common.types.Plan;
import com.tripmates.backend.common.types.PlanMetadata;
import com.tripmates.backend.common.types.PlanMetadataWithContent;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.service.email.EmailService;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;

@Service
@Transactional
public class CommunityService {
  private final AccountRepository accountRepository;
  private final EmailService emailService;
  private final PublicationRepository publicationRepository;

  public CommunityService(AccountRepository accountRepository, EmailService emailService, PublicationRepository publicationRepository) {
    this.accountRepository = accountRepository;
    this.emailService = emailService;
    this.publicationRepository = publicationRepository;
  }

  public void inviteUserToPlan(String planId, String userId, String currentUserEmail) {
    Account me = validateUserOrThrowUnauthorizedFromEmail(currentUserEmail);
    Account userToInvite = validateUserOrThrowUnauthorizedFromId(userId);
    PlanMetadata plan = validateExistentPlan(planId);

    if (!plan.ownerId().equals(me.getId())) {
      throw new UnauthorizedException(ValidationErrorMessage.UNAUTHORIZED);
    }
    if (plan.collaboratorsIds().contains(userId)) {
      throw new UnauthorizedException(ValidationErrorMessage.USER_ALREADY_IN_PLAN);
    }
    if (plan.pendingUsersIdsInvited().contains(userId)) {
      throw new UnauthorizedException(ValidationErrorMessage.USER_ALREADY_INVITED_TO_PLAN);
    }

    accountRepository.addUserIdToPendingUsersIdsInvitedToPlan(planId, userId);
    emailService.sendEmail(userToInvite.getEmail(), "Invitation to plan", "You have been invited to join the plan " + plan.name());    
  }

  public void acceptInvitation(String planId, String currentUserEmail) {
    Account me = validateUserOrThrowUnauthorizedFromEmail(currentUserEmail); 
    PlanMetadata plan = validateExistentPlan(planId);
    if (!plan.pendingUsersIdsInvited().contains(me.getId())) {
      throw new UnauthorizedException(ValidationErrorMessage.USER_NOT_INVITED_TO_PLAN);
    }
    accountRepository.upgradeUserFromInvitedToCollaborator(planId, me.getId());
  }

  public void declineInvitation(String planId, String currentUserEmail) {
    Account me = validateUserOrThrowUnauthorizedFromEmail(currentUserEmail); 
    PlanMetadata plan = validateExistentPlan(planId);
    if (!plan.pendingUsersIdsInvited().contains(me.getId())) {
      throw new UnauthorizedException(ValidationErrorMessage.USER_NOT_INVITED_TO_PLAN);
    }
    accountRepository.removeUserIdFromPendingUsersIdsInvitedToPlan(planId, me.getId());
  }

  public List<PlanWithPublicationsResponseDTO> getPlans(String email) {
		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		if (account.getRole() != Role.USER)
			throw new BadRequestException(ValidationErrorMessage.UNAUTHORIZED);

    List<PlanWithPublicationsResponseDTO> plansResponse = new ArrayList<>();
    addCollaborationsPlansToResponse(plansResponse, account.getId());
    if (account.getPlansList() != null) {
      addMyOwnPlansToResponse(plansResponse, account.getPlansList());
    }
		return plansResponse;
	}

  public PlanWithPublicationsResponseDTO getPlanById(String planId, String email) {
    validateUserOrThrowUnauthorizedFromEmail(email);
    PlanMetadata planMetadata = validateExistentPlan(planId);
    List<String> planPublicationsIds = accountRepository.getPlanPublicationsIds(planId);
    PlanMetadataWithContent planMetadataWithContent = new PlanMetadataWithContent(
      planMetadata.planId(), 
      planMetadata.name(), 
      planMetadata.description(), 
      planMetadata.ownerId(), 
      planMetadata.collaboratorsIds(), 
      planMetadata.pendingUsersIdsInvited(), 
      planPublicationsIds);
    
    return PlanWithPublicationsResponseDTO.fromPlanMetadataWithContent(planMetadataWithContent, publicationRepository);
  }

  private Account validateUserOrThrowUnauthorizedFromId(String accountId) {
    Account account = accountRepository.findById(accountId).orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
    return checkUserRolOrThrowUnauthorized(account);
  }
  
  private Account validateUserOrThrowUnauthorizedFromEmail(String email) {
    Account account = accountRepository.findByEmail(email).orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
    return checkUserRolOrThrowUnauthorized(account);
  }

  private Account checkUserRolOrThrowUnauthorized(Account account) {
    if (account.getRole() != Role.USER) {
      throw new UnauthorizedException(ValidationErrorMessage.UNAUTHORIZED);
    }
    return account;
  }

  private PlanMetadata validateExistentPlan(String planId) {
    PlanMetadata plan = accountRepository.getPlanMetadataById(planId);
    if (plan == null) {
      throw new NotFoundException(ValidationErrorMessage.PLAN_NOT_FOUND);
    }
    return plan;
  }


  private void addCollaborationsPlansToResponse(List<PlanWithPublicationsResponseDTO> plansResponse, String collaboratorUserId) {
    List<PlanMetadataWithContent> plansMetadataCollaborations = accountRepository.getCollaborationsPlansByUserId(collaboratorUserId);
      for (PlanMetadataWithContent planMetadataWithContent : plansMetadataCollaborations) {
        var planWithPublications = PlanWithPublicationsResponseDTO.fromPlanMetadataWithContent(planMetadataWithContent, publicationRepository);
        plansResponse.add(planWithPublications);
      }
  }

  private void addMyOwnPlansToResponse(List<PlanWithPublicationsResponseDTO> plansResponse, List<Plan> myPlans) {
    for (Plan plan : myPlans) {
      var planWithPublications = PlanWithPublicationsResponseDTO.fromPlan(plan, publicationRepository);
      plansResponse.add(planWithPublications);
    }
  }
}
