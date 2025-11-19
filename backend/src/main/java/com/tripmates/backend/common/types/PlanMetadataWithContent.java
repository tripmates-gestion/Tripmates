package com.tripmates.backend.common.types;

import java.util.List;

public record PlanMetadataWithContent(  
  String planId,
  String name, 
  String description, 
  String ownerId, 
  List<String> collaboratorsIds, 
  List<String> pendingUsersIdsInvited,
  List<String> publicationsIds) {
}
