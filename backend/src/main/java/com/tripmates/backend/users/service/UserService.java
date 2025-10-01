package com.tripmates.backend.users.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tripmates.backend.users.dto.UserCreationRequestDTO;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;

@Service
@Transactional
public class UserService {
    private UserRepository userRepository;

    public User createUser(UserCreationRequestDTO userCreationRequestDTO) {
        var user = new User();
        return userRepository.save(user);
    }
}
