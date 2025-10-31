package com.tripmates.backend.users;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.config.TestSecurityConfig;
import com.tripmates.backend.users.dto.UserResumeResponseDTO;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRespository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
// import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Import({ TestCloudinaryConfig.class, TestSecurityConfig.class })
public class SearchAccountTest {

	@LocalServerPort
	private int port;

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private AccountRespository userRepository;

	private String baseUrl() {
		return "http://localhost:" + port;
	}

	@BeforeEach
	void beforeEach() {
		mongoTemplate.getDb().drop();
	}

	@AfterAll
	void afterAll() {
		mongoTemplate.getDb().drop();
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record PageResponse<T>(List<T> content, int totalPages, long totalElements, int number, int size) {
	}

	// @Test
	// void searchWithFiltersButWithNoUsersShouldReturnNothing() {
	// String url = baseUrl()
	// + "/users/search?name=Fran Infanti&location=Buenos Aires, 3 de
	// Febrero&role=BUSINESS&businessType=TOURISM";

	// ResponseEntity<PageResponse<UserResumeResponseDTO>> response =
	// restTemplate.exchange(url, HttpMethod.GET, null,
	// new ParameterizedTypeReference<>() {
	// });

	// assertEquals(HttpStatus.OK, response.getStatusCode());

	// PageResponse<UserResumeResponseDTO> page = response.getBody();

	// Assertions.assertNotNull(page);
	// Assertions.assertEquals(0, page.totalElements());
	// Assertions.assertTrue(page.content().isEmpty());
	// }

	@Test
	void searchWithNoFiltersShouldReturnAllUsers() {
		Account fran = new Account();
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

	// @Test
	// void filterByRoleUserReturnsOnlyUsersAccounts() {
	// Account markZuckerberg = new Account();
	// markZuckerberg.setEmail("mark@facebook.com");
	// markZuckerberg.setName("Mark Zuckerberg");
	// markZuckerberg.setPassword("1234678");
	// markZuckerberg.setRole(Role.USER);

	// Account louvre = new Account();
	// louvre.setEmail("louvre@museum.com.fr");
	// louvre.setName("Louvre Museum");
	// louvre.setPassword("12345678");
	// louvre.setBusinessType(BusinessType.TOURISM);
	// louvre.setRole(Role.BUSINESS);

	// userRepository.saveAll(List.of(markZuckerberg, louvre));

	// String url = UriComponentsBuilder.fromHttpUrl(baseUrl() + "/users/search")
	// .queryParam("role", "USER")
	// .toUriString();

	// ResponseEntity<PageResponse<UserResumeResponseDTO>> response =
	// restTemplate.exchange(url, HttpMethod.GET, null,
	// new ParameterizedTypeReference<>() {
	// });

	// assertEquals(HttpStatus.OK, response.getStatusCode());

	// PageResponse<UserResumeResponseDTO> page = response.getBody();

	// Assertions.assertNotNull(page);
	// Assertions.assertEquals(1, page.totalElements());
	// Assertions.assertEquals(List.of(UserResumeResponseDTO.fromUser(markZuckerberg)),
	// page.content());
	// }

	// @Test
	// void filterByBusinessTypeReturnsOnlyBusinessTypesBusinessAccounts() {
	// Account sigaLaVaca = new Account();
	// sigaLaVaca.setEmail("sigaLaVaca@gmail.com");
	// sigaLaVaca.setName("Siga La Vaca");
	// sigaLaVaca.setPassword("12345678");
	// sigaLaVaca.setBusinessType(BusinessType.RESTAURANT);
	// sigaLaVaca.setRole(Role.BUSINESS);

	// Account kansas = new Account();
	// kansas.setEmail("kansas@gmail.com.ar");
	// kansas.setName("Kansas");
	// kansas.setPassword("123456789");
	// kansas.setBusinessType(BusinessType.RESTAURANT);
	// kansas.setRole(Role.BUSINESS);

	// Account rosmarie = new Account();
	// rosmarie.setEmail("rosmarie@gmail.com.ar");
	// rosmarie.setName("Rosmarie");
	// rosmarie.setPassword("12345678");
	// rosmarie.setBusinessType(BusinessType.HOSTING);
	// rosmarie.setRole(Role.BUSINESS);

	// userRepository.saveAll(List.of(sigaLaVaca, kansas, rosmarie));

	// String url = UriComponentsBuilder.fromHttpUrl(baseUrl() + "/users/search")
	// .queryParam("businessType", "RESTAURANT")
	// .toUriString();

	// ResponseEntity<PageResponse<UserResumeResponseDTO>> response =
	// restTemplate.exchange(url, HttpMethod.GET, null,
	// new ParameterizedTypeReference<>() {
	// });

	// assertEquals(HttpStatus.OK, response.getStatusCode());

	// PageResponse<UserResumeResponseDTO> page = response.getBody();

	// Assertions.assertNotNull(page);
	// Assertions.assertEquals(2, page.totalElements());
	// Assertions.assertEquals(
	// List.of(UserResumeResponseDTO.fromUser(sigaLaVaca),
	// UserResumeResponseDTO.fromUser(kansas)),
	// page.content());
	// }

	@Test
	void filterByLocationReturnsOnlyBusinessAccountsWithThatLocation() {
		Account mcDonalds = new Account();
		mcDonalds.setEmail("McDonalds@gmail.com.ar");
		mcDonalds.setName("McDonald's");
		mcDonalds.setPassword("123456789");
		mcDonalds.setLocation("Buenos Aires, Martinez Unicenter");
		mcDonalds.setBusinessType(BusinessType.RESTAURANT);
		mcDonalds.setRole(Role.BUSINESS);

		Account burgerKing = new Account();
		burgerKing.setEmail("kansas@gmail.com.ar");
		burgerKing.setName("Kansas");
		burgerKing.setPassword("123456789");
		burgerKing.setLocation("Buenos Aires, 3 De Febrero");
		burgerKing.setBusinessType(BusinessType.RESTAURANT);
		burgerKing.setRole(Role.BUSINESS);

		userRepository.saveAll(List.of(mcDonalds, burgerKing));

		String url = baseUrl() + "/users/search?location=Buenos Aires, Martinez Unicenter";

		ResponseEntity<PageResponse<UserResumeResponseDTO>> response = restTemplate.exchange(url, HttpMethod.GET, null,
				new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<UserResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());
		Assertions.assertEquals(List.of(UserResumeResponseDTO.fromUser(mcDonalds)), page.content());
	}

	@Test
	void filterWithMultipleFiltersReturnsOnlyValidAccounts() {
		Account wendys = new Account();
		wendys.setEmail("Wendys@gmail.com.us");
		wendys.setName("Wendy's");
		wendys.setPassword("123456789");
		wendys.setLocation("England, London");
		wendys.setBusinessType(BusinessType.RESTAURANT);
		wendys.setRole(Role.BUSINESS);

		Account alanTuring = new Account();
		alanTuring.setEmail("alanTuring@gmail.com");
		alanTuring.setName("Alan Turing");
		alanTuring.setPassword("123456789");
		alanTuring.setRole(Role.USER);

		userRepository.saveAll(List.of(wendys, alanTuring));

		String url = baseUrl() + "/users/search?role=BUSINESS&location=England, London&businessType=RESTAURANT";

		ResponseEntity<PageResponse<UserResumeResponseDTO>> response = restTemplate.exchange(url, HttpMethod.GET, null,
				new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<UserResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());
		Assertions.assertEquals(List.of(UserResumeResponseDTO.fromUser(wendys)), page.content());
	}

	@Test
	void filterByUsernameReturnsOnlyValidAccounts() {
		Account billGates = new Account();
		billGates.setEmail("billGates@microsoft.com");
		billGates.setName("TheBill's Gates");
		billGates.setPassword("12345678");
		billGates.setLocation("California, Los Angeles");
		billGates.setRole(Role.USER);

		Account timCook = new Account();
		timCook.setEmail("timCook@apple.com");
		timCook.setName("Tim Cook");
		timCook.setPassword("12345678");
		timCook.setLocation("California, Los Angeles");
		timCook.setRole(Role.USER);

		userRepository.saveAll(List.of(timCook, billGates));

		String url = baseUrl() + "/users/search?username=Tim Cook&location=California, Los Angeles";

		ResponseEntity<PageResponse<UserResumeResponseDTO>> response = restTemplate.exchange(url, HttpMethod.GET, null,
				new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<UserResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());
		Assertions.assertEquals(List.of(UserResumeResponseDTO.fromUser(timCook)), page.content());
	}

}
