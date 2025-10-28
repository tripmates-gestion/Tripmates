package com.tripmates.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.tripmates.backend.auth.dto.AuthRegisterRequestDTO;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.config.TestSecurityConfig;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
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
@Import({ TestCloudinaryConfig.class, TestSecurityConfig.class })
public class AuthControllerTests {

	@LocalServerPort
	private int port;

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private UserRepository userRepository;

	private String baseUrl() {
		return "http://localhost:" + port;
	}

	@BeforeEach
	void beforeEach() {
		userRepository.deleteAll();
	}

	@Test
	void registerUserShouldReturnNoContent() {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("fran", "fran@example.com", "123456",
				Role.USER, null);

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<Void> response = restTemplate.postForEntity(baseUrl() + "/auth/register", request, Void.class);

		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
		assertEquals(1, userRepository.count());
	}

}