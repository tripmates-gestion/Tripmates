package com.tripmates.backend.users.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tripmates.backend.users.dto.UserCreationRequestDTO;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createUser(UserCreationRequestDTO userCreationRequestDTO) {
        var user = new User();
        user.setEmail(userCreationRequestDTO.email());
        user.setPassword(userCreationRequestDTO.password());
        user.setRole(userCreationRequestDTO.role());
        return userRepository.save(user);
    }
}
