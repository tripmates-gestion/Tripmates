package com.tripmates.backend.common.types;

import java.util.List;

public record PlanMetadata(
  String name, 
  String description, 
  String ownerId, 
  List<String> collaboratorsIds, 
  List<String> pendingUsersIdsInvited) {
  
}
