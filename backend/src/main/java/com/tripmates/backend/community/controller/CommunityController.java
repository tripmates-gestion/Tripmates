package com.tripmates.backend.community.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;

import com.tripmates.backend.community.service.CommunityService;

import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/community")
public class CommunityController {
  private final CommunityService communityService;

  public CommunityController(CommunityService communityService) {
    this.communityService = communityService;
  }

  @PostMapping("/{planId}/{userId}/invite-user")
  public ResponseEntity<?> inviteUserToPlan
  (
    @PathVariable("planId") Long planId,
    @PathVariable("userId") Long userId
  ) {
    communityService.inviteUserToPlan(planId, userId);
    return ResponseEntity.noContent().build();
  }
}
