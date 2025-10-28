package com.tripmates.backend.users;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.config.TestSecurityConfig;
import com.tripmates.backend.users.dto.UserResumeResponseDTO;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

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
	void beforeEach() {
		userRepository.deleteAll();
	}

	@AfterAll
	void afterAll() {
		userRepository.deleteAll();
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record PageResponse<T>(List<T> content, int totalPages, long totalElements, int number, int size) {
	}

	@Test
	void searchWithZeroUsersShouldReturnNothing() {
		ResponseEntity<PageResponse<UserResumeResponseDTO>> response = restTemplate
			.exchange(baseUrl() + "/users/search", HttpMethod.GET, null, new ParameterizedTypeReference<>() {
			});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<UserResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(0, page.totalElements());
		Assertions.assertTrue(page.content().isEmpty());
	}

	@Test
	void searchWithNoFiltersShouldReturnAllUsers() {
		User fran = new User();
		fran.setEmail("fran@fi.uba.ar");
		fran.setName("FranInfanti");
		fran.setPassword("1234");
		fran.setRole(Role.USER);

		userRepository.saveAll(List.of(fran));

		ResponseEntity<PageResponse<UserResumeResponseDTO>> response = restTemplate
			.exchange(baseUrl() + "/users/search", HttpMethod.GET, null, new ParameterizedTypeReference<>() {
			});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<UserResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());
		Assertions.assertEquals(List.of(UserResumeResponseDTO.fromUser(fran)), page.content());
	}

	@Test
	void filterByUserTypeWorksAsExpected() {
		User fran = new User();
		fran.setEmail("fran@fi.uba.ar");
		fran.setName("FranInfanti");
		fran.setPassword("1234");
		fran.setRole(Role.USER);

		User oli = new User();
		oli.setEmail("oli@gmail.com");
		oli.setName("Oli123");
		oli.setPassword("987456");
		oli.setRole(Role.USER);

		User billGates = new User();
		billGates.setEmail("billGates@microsoft.com");
		billGates.setName("TheBill's Gates");
		billGates.setPassword("Windows11:)");
		billGates.setBusinessType(BusinessType.TOURISM);
		billGates.setRole(Role.BUSINESS);

		userRepository.saveAll(List.of(fran, oli, billGates));

		String url = UriComponentsBuilder.fromHttpUrl(baseUrl() + "/users/search")
			.queryParam("role", "USER")
			.toUriString();

		ResponseEntity<PageResponse<UserResumeResponseDTO>> response = restTemplate.exchange(url, HttpMethod.GET, null,
				new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<UserResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(2, page.totalElements());

		List<UserResumeResponseDTO> userResumeResponseDTOList = List.of(UserResumeResponseDTO.fromUser(fran),
				UserResumeResponseDTO.fromUser(oli));

		Assertions.assertEquals(userResumeResponseDTOList, page.content());
	}

	@Test
	void filterByBusinessTypeWorksAsExpected() {
		User jeffBezos = new User();
		jeffBezos.setEmail("jeffBezos@amazon.com");
		jeffBezos.setName("Jeff Bezos");
		jeffBezos.setPassword("AWS1234");
		jeffBezos.setBusinessType(BusinessType.RESTAURANT);
		jeffBezos.setRole(Role.USER);

		User markCuban = new User();
		markCuban.setEmail("markCuban@mavs.com");
		markCuban.setName("Mark Cuban");
		markCuban.setPassword("12345678");
		markCuban.setBusinessType(BusinessType.HOSTING);
		markCuban.setRole(Role.USER);

		User billGates = new User();
		billGates.setEmail("billGates@microsoft.com");
		billGates.setName("TheBill's Gates");
		billGates.setPassword("Windows11:)");
		billGates.setBusinessType(BusinessType.TOURISM);
		billGates.setRole(Role.BUSINESS);

		userRepository.saveAll(List.of(jeffBezos, markCuban, billGates));

		String url = UriComponentsBuilder.fromHttpUrl(baseUrl() + "/users/search")
			.queryParam("businessType", "RESTAURANT")
			.toUriString();

		ResponseEntity<PageResponse<UserResumeResponseDTO>> response = restTemplate.exchange(url, HttpMethod.GET, null,
				new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<UserResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());

		List<UserResumeResponseDTO> userResumeResponseDTOList = List.of(UserResumeResponseDTO.fromUser(jeffBezos));

		Assertions.assertEquals(userResumeResponseDTOList, page.content());
	}

	@Test
	void filterByLocationWorksAsExpected() {
		User jeffBezos = new User();
		jeffBezos.setEmail("jeffBezos@amazon.com");
		jeffBezos.setName("Jeff Bezos");
		jeffBezos.setPassword("AWS1234");
		jeffBezos.setLocation("West US");
		jeffBezos.setBusinessType(BusinessType.RESTAURANT);
		jeffBezos.setRole(Role.USER);

		User markCuban = new User();
		markCuban.setEmail("markCuban@mavs.com");
		markCuban.setName("Mark Cuban");
		markCuban.setPassword("12345678");
		markCuban.setLocation("California, Los Angeles");
		markCuban.setBusinessType(BusinessType.HOSTING);
		markCuban.setRole(Role.USER);

		User billGates = new User();
		billGates.setEmail("billGates@microsoft.com");
		billGates.setName("TheBill's Gates");
		billGates.setPassword("Windows11:)");
		billGates.setLocation("California, Los Angeles");
		billGates.setBusinessType(BusinessType.TOURISM);
		billGates.setRole(Role.BUSINESS);

		userRepository.saveAll(List.of(jeffBezos, markCuban, billGates));

		String url = baseUrl() + "/users/search?location=California, Los Angeles";

		ResponseEntity<PageResponse<UserResumeResponseDTO>> response = restTemplate.exchange(url, HttpMethod.GET, null,
				new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<UserResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(2, page.totalElements());

		List<UserResumeResponseDTO> userResumeResponseDTOList = List.of(UserResumeResponseDTO.fromUser(markCuban),
				UserResumeResponseDTO.fromUser(billGates));

		Assertions.assertEquals(userResumeResponseDTOList, page.content());
	}

	@Test
	void filterByBusinessAndUserTypeWorksAsExpected() {
		User jeffBezos = new User();
		jeffBezos.setEmail("jeffBezos@amazon.com");
		jeffBezos.setName("Jeff Bezos");
		jeffBezos.setPassword("AWS1234");
		jeffBezos.setRole(Role.USER);

		User markCuban = new User();
		markCuban.setEmail("markCuban@mavs.com");
		markCuban.setName("Mark Cuban");
		markCuban.setPassword("12345678");
		markCuban.setBusinessType(BusinessType.HOSTING);
		markCuban.setRole(Role.BUSINESS);

		User billGates = new User();
		billGates.setEmail("billGates@microsoft.com");
		billGates.setName("TheBill's Gates");
		billGates.setPassword("Windows11:)");
		billGates.setBusinessType(BusinessType.TOURISM);
		billGates.setRole(Role.BUSINESS);

		userRepository.saveAll(List.of(jeffBezos, markCuban, billGates));

		String url = UriComponentsBuilder.fromHttpUrl(baseUrl() + "/users/search")
			.queryParam("userType", "BUSINESS")
			.queryParam("businessType", "HOSTING")
			.toUriString();

		ResponseEntity<PageResponse<UserResumeResponseDTO>> response = restTemplate.exchange(url, HttpMethod.GET, null,
				new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<UserResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());

		List<UserResumeResponseDTO> userResumeResponseDTOList = List.of(UserResumeResponseDTO.fromUser(markCuban));

		Assertions.assertEquals(userResumeResponseDTOList, page.content());
	}

	@Test
	void filterByBusinessTypeAndLocationWorksAsExpected() {
		User jeffBezos = new User();
		jeffBezos.setEmail("jeffBezos@amazon.com");
		jeffBezos.setName("Jeff Bezos");
		jeffBezos.setPassword("AWS1234");
		jeffBezos.setLocation("West US");
		jeffBezos.setBusinessType(BusinessType.RESTAURANT);
		jeffBezos.setRole(Role.USER);

		User markCuban = new User();
		markCuban.setEmail("markCuban@mavs.com");
		markCuban.setName("Mark Cuban");
		markCuban.setPassword("12345678");
		markCuban.setLocation("New York, The Bronx");
		markCuban.setBusinessType(BusinessType.HOSTING);
		markCuban.setRole(Role.USER);

		User billGates = new User();
		billGates.setEmail("billGates@microsoft.com");
		billGates.setName("TheBill's Gates");
		billGates.setPassword("Windows11:)");
		billGates.setLocation("California, Los Angeles");
		billGates.setBusinessType(BusinessType.TOURISM);
		billGates.setRole(Role.BUSINESS);

		userRepository.saveAll(List.of(jeffBezos, markCuban, billGates));

		String url = baseUrl() + "/users/search?location=New York, The Bronx&businessType=HOSTING";

		ResponseEntity<PageResponse<UserResumeResponseDTO>> response = restTemplate.exchange(url, HttpMethod.GET, null,
				new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<UserResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());

		List<UserResumeResponseDTO> userResumeResponseDTOList = List.of(UserResumeResponseDTO.fromUser(markCuban));

		Assertions.assertEquals(userResumeResponseDTOList, page.content());
	}

}
