package com.tripmates.backend;

import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.users.dto.UserCreationRequestDTO;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.*;
import org.springframework.boot.test.mock.mockito.MockBean;
import java.util.Optional;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Import(TestCloudinaryConfig.class)
public class AuthControllerTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @MockBean
    private UserRepository userRepository;

    private String baseUrl;

    @BeforeAll
    void setUp() {
        baseUrl = "http://localhost:" + port;
    }

    @Test
    void registerUserTest() {
        when(userRepository.findByEmail("fran@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        UserCreationRequestDTO requestDTO = new UserCreationRequestDTO(
                "fran",
                "fran@example.com",
                "123456",
                Role.USER,
                null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<UserCreationRequestDTO> request = new HttpEntity<>(requestDTO, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
            baseUrl + "/auth/register",
            request,
            String.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}