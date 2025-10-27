package com.tripmates.backend;

import com.tripmates.backend.users.dto.UserCreationRequestDTO;
import com.tripmates.backend.users.entity.Role;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class AuthControllerTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String baseUrl;

    @BeforeAll
    void setUp() {
        baseUrl = "http://localhost:" + port;
    }

    @Test
    void registerUserTest() {
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

        ResponseEntity<Void> response = restTemplate.postForEntity(
                baseUrl + "/auth/register",
                request,
                Void.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
