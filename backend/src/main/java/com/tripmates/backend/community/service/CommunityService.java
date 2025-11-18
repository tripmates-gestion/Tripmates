package com.tripmates.backend.community.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.NotFoundException;
import com.tripmates.backend.common.exception.UnauthorizedException;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.common.types.PlanMetadata;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.service.email.EmailService;

@Service
@Transactional
public class CommunityService {
  private final AccountRepository accountRepository;
  private final EmailService emailService;

  public CommunityService(AccountRepository accountRepository, EmailService emailService) {
    this.accountRepository = accountRepository;
    this.emailService = emailService;
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
    //para testear dejar comentado
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
}
