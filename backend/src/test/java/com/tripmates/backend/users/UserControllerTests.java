package com.tripmates.backend.users;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.config.TestSecurityConfig;
import com.tripmates.backend.users.dto.UserResumeResponseDTO;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Import({ TestCloudinaryConfig.class, TestSecurityConfig.class })
public class UserControllerTests {

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
	void cleanDb() {
		userRepository.deleteAll();
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record PageResponse<T>(List<T> content, int totalPages, long totalElements, int number, int size) {
	}

	@Test
	void searchWithZeroUsersShouldReturnNothing() {
		ResponseEntity<PageResponse<UserResumeResponseDTO>> response = restTemplate.exchange(
				baseUrl() + "/users/search", HttpMethod.GET, null,
				new ParameterizedTypeReference<PageResponse<UserResumeResponseDTO>>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<UserResumeResponseDTO> page = response.getBody();
		Assertions.assertNotNull(page);
		Assertions.assertEquals(0, page.totalElements());
		Assertions.assertTrue(page.content().isEmpty());
	}
    
}
