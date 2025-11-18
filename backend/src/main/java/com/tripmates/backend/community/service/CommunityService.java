package com.tripmates.backend.community.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.NotFoundException;
import com.tripmates.backend.common.exception.UnauthorizedException;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.users.dto.plan.PlanMetadataResponseDTO;
import com.tripmates.backend.users.entity.mongo.Account;

@Service
@Transactional
public class CommunityService {
  private final AccountRepository accountRepository;

  public CommunityService(AccountRepository accountRepository) {
    this.accountRepository = accountRepository;
  }

  public void inviteUserToPlan(String planId, String userId, String currentUserEmail) {
    Account me = accountRepository.findByEmail(currentUserEmail).orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
    PlanMetadataResponseDTO plan = validateExistentPlan(planId);

    if (!plan.ownerId().equals(me.getId())) {
      throw new UnauthorizedException(ValidationErrorMessage.UNAUTHORIZED);
    }
    accountRepository.addUserIdToPendingUsersIdsInvitedToPlan(me.getId(), planId, userId);
    
  }



  private PlanMetadataResponseDTO validateExistentPlan(String planId) {
    PlanMetadataResponseDTO plan = accountRepository.getPlanMetadataById(planId);
    if (plan == null) {
      throw new NotFoundException(ValidationErrorMessage.PLAN_NOT_FOUND);
    }
    return plan;
  }
}
