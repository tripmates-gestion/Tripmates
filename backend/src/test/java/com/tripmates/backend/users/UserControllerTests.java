package com.tripmates.backend.users;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.config.TestSecurityConfig;
import com.tripmates.backend.users.dto.UserResumeResponseDTO;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
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

	@MockBean
	private UserRepository userRepository;

	private String baseUrl;

	@BeforeAll
	void setUp() {
		baseUrl = "http://localhost:" + port;
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record PageResponse<T>(List<T> content, int totalPages, long totalElements, int number, int size) {}

	@Test
	void searchingWithNoFiltersShouldReturnAllUsers() {
		User fran = new User();
		fran.setEmail("fran@fi.uba.ar");
		fran.setName("FranInfanti");
		fran.setPassword("1234");
		fran.setRole(Role.USER);

		Page<User> userPage = new PageImpl<>(List.of(fran), PageRequest.of(0, 10), 1);
		when(userRepository.searchUsers(any(), any(), any(), any(Pageable.class))).thenReturn(userPage);

		ResponseEntity<PageResponse<UserResumeResponseDTO>> response = restTemplate.exchange(baseUrl + "/users/search",
				HttpMethod.GET, null, new ParameterizedTypeReference<PageResponse<UserResumeResponseDTO>>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<UserResumeResponseDTO> page = response.getBody();
		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());

		assertEquals(List.of(UserResumeResponseDTO.fromUser(fran)), page.content());
	}

}
