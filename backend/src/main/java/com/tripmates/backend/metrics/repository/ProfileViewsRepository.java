package com.tripmates.backend.metrics.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tripmates.backend.metrics.entity.mongo.ProfileView;

public interface ProfileViewsRepository extends MongoRepository<ProfileView, String> {
  List<ProfileView> findByProfileSeenEmailAndDateBetween(String email, Date startTime, Date endTime);
}
