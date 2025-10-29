<<<<<<< HEAD
package com.tripmates.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
=======
>>>>>>> origin/dev-front

package com.tripmates.backend.auth;

import com.tripmates.backend.auth.dto.AuthRegisterRequestDTO;
import com.tripmates.backend.config.TestCloudinaryConfig;
<<<<<<< HEAD
import com.tripmates.backend.config.TestSecurityConfig;
import com.tripmates.backend.users.dto.UserCreationRequestDTO;
=======
>>>>>>> origin/dev-front
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.repository.mongo.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

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
	void cleanDb() {
		userRepository.deleteAll();
	}

<<<<<<< HEAD
	@Test
	void registerUserShouldReturnNoContent() {
		UserCreationRequestDTO requestDTO = new UserCreationRequestDTO("fran", "fran@example.com", "123456", Role.USER,
				null);
=======
    @Test
    void registerUserTest() {
        when(userRepository.findByEmail("fran@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        AuthRegisterRequestDTO requestDTO = new AuthRegisterRequestDTO(
                "fran",
                "fran@example.com",
                "123456",
                Role.USER,
                null);
>>>>>>> origin/dev-front

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

<<<<<<< HEAD
		HttpEntity<UserCreationRequestDTO> request = new HttpEntity<>(requestDTO, headers);

		ResponseEntity<Void> response = restTemplate.postForEntity(baseUrl() + "/auth/register", request, Void.class);
=======
        HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(requestDTO, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/auth/register",
                request,
                String.class);
>>>>>>> origin/dev-front

		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
		assertEquals(1, userRepository.count());
	}

}
