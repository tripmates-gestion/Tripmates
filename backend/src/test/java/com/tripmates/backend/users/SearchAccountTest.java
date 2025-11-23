package com.tripmates.backend.users;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tripmates.backend.common.types.*;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.config.TestSecurityConfig;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;
import com.tripmates.backend.users.dto.account.AccountResumeResponseDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.*;
import org.springframework.lang.Nullable;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalTime;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

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
	private AccountRepository accountRepository;

	@Autowired
	private PublicationRepository publicationRepository;

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

	private <T> ResponseEntity<T> searchBusiness(String url, @Nullable String requestBody,
			ParameterizedTypeReference<T> responseType) {

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		HttpEntity<String> entity = requestBody != null ? new HttpEntity<>(requestBody, headers)
				: new HttpEntity<>(headers);

		return restTemplate.exchange(url, HttpMethod.POST, entity, responseType);
	}

	private <T> ResponseEntity<T> searchUser(String url, ParameterizedTypeReference<T> responseType) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		HttpEntity<Void> entity = new HttpEntity<>(headers);
		return restTemplate.exchange(url, HttpMethod.GET, entity, responseType);
	}

	@Test
	void testSearchWithNoneFilters() {
		Account kansas = new Account();
		kansas.setEmail("kansas@gmail.com.ar");
		kansas.setName("Kansas");
		kansas.setPassword("123456789");
		kansas.setBusinessType(BusinessType.RESTAURANT);
		kansas.setRole(Role.BUSINESS);

		accountRepository.save(kansas);

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = searchBusiness(
				baseUrl() + "/users/search/business", "{}", new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<AccountResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());
		Assertions.assertEquals(List.of(AccountResumeResponseDTO.fromAccount(kansas)), page.content());
	}

	@Test
	void testSearchWithBusinessTypeFilter() {
		Account sigaLaVaca = new Account();
		sigaLaVaca.setEmail("sigaLaVaca@gmail.com");
		sigaLaVaca.setName("Siga La Vaca");
		sigaLaVaca.setPassword("12345678");
		sigaLaVaca.setBusinessType(BusinessType.RESTAURANT);
		sigaLaVaca.setRole(Role.BUSINESS);

		Account pfchang = new Account();
		pfchang.setEmail("pfchangs@gmail.com.ar");
		pfchang.setName("P.F Chang's");
		pfchang.setPassword("123456789");
		pfchang.setBusinessType(BusinessType.RESTAURANT);
		pfchang.setRole(Role.BUSINESS);

		Account rosmarie = new Account();
		rosmarie.setEmail("rosmarie@gmail.com.ar");
		rosmarie.setName("Rosmarie");
		rosmarie.setPassword("12345678");
		rosmarie.setBusinessType(BusinessType.HOTEL);
		rosmarie.setRole(Role.BUSINESS);

		accountRepository.saveAll(List.of(sigaLaVaca, pfchang, rosmarie));

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = searchBusiness(
				baseUrl() + "/users/search/business", "{ \"businessType\": \"RESTAURANT\" }",
				new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<AccountResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(2, page.totalElements());
		Assertions.assertEquals(List.of(AccountResumeResponseDTO.fromAccount(sigaLaVaca),
				AccountResumeResponseDTO.fromAccount(pfchang)), page.content());
	}

	@Test
	void testSearchWithLocationFilter() {
		Account mcDonalds = new Account();
		mcDonalds.setEmail("McDonalds@gmail.com.ar");
		mcDonalds.setName("McDonald's");
		mcDonalds.setPassword("123456789");
		mcDonalds.setLocation(new Location("Buenos Aires, Martinez Unicenter", 27.1234, 27.1234));
		mcDonalds.setBusinessType(BusinessType.RESTAURANT);
		mcDonalds.setRole(Role.BUSINESS);

		Account burgerKing = new Account();
		burgerKing.setEmail("kansas@gmail.com.ar");
		burgerKing.setName("Kansas");
		burgerKing.setPassword("123456789");
		burgerKing.setLocation(new Location("Buenos Aires, 3 De Febrero", 27.1234, 27.1234));
		burgerKing.setBusinessType(BusinessType.RESTAURANT);
		burgerKing.setRole(Role.BUSINESS);

		accountRepository.saveAll(List.of(mcDonalds, burgerKing));

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = searchBusiness(
				baseUrl() + "/users/search/business", """
						{
						"location": {
							"address": "Buenos Aires, Martinez Unicenter"
						}
						}
						""", new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<AccountResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());
		Assertions.assertEquals(List.of(AccountResumeResponseDTO.fromAccount(mcDonalds)), page.content());
	}

	@Test
	void testSearchWithUsernameFilter() {
		Account wendys = new Account();
		wendys.setEmail("Wendys@gmail.com.us");
		wendys.setName("Wendy's");
		wendys.setPassword("123456789");
		wendys.setLocation(new Location("England, London", 27.1234, 27.1234));
		wendys.setBusinessType(BusinessType.RESTAURANT);
		wendys.setRole(Role.BUSINESS);

		Account hutch = new Account();
		hutch.setEmail("hutch@gmail.com.ar");
		hutch.setName("Hutch");
		hutch.setPassword("123456789");
		hutch.setLocation(new Location("Ciudad Jardin, Lomas del Palomar", 27.1234, 27.1234));
		hutch.setBusinessType(BusinessType.RESTAURANT);
		hutch.setRole(Role.BUSINESS);

		accountRepository.saveAll(List.of(wendys, hutch));

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = searchBusiness(
				baseUrl() + "/users/search/business", """
						    {
						      "username": "Hutch"
						    }
						""", new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<AccountResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());
		Assertions.assertEquals(List.of(AccountResumeResponseDTO.fromAccount(hutch)), page.content());
	}

	@Test
	void testSearchWithAveragePriceFilter() {
		Account sheraton = new Account();
		sheraton.setEmail("shearton@gmail.com");
		sheraton.setName("Sheraton");
		sheraton.setPassword("123456789");
		sheraton.setLocation(
				new Location("Panamericana Km 49.5, B1629 Pilar, Provincia de Buenos Aires", 27.1234, 27.1234));
		sheraton.setBusinessType(BusinessType.HOTEL);
		sheraton.setAveragePrice(AveragePrice.$$$);
		sheraton.setRole(Role.BUSINESS);

		Account graff = new Account();
		graff.setEmail("graff@gmail.com.ar");
		graff.setName("Graff");
		graff.setPassword("123456789");
		graff.setLocation(new Location("Ciudad Jardin, Lomas del Palomar", 27.1234, 27.1234));
		graff.setBusinessType(BusinessType.RESTAURANT);
		graff.setAveragePrice(AveragePrice.$);
		graff.setRole(Role.BUSINESS);

		accountRepository.saveAll(List.of(sheraton, graff));

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = searchBusiness(
				baseUrl() + "/users/search/business", """
						    {
						      "averagePrice": "$$$"
						    }
						""", new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<AccountResumeResponseDTO> page = response.getBody();

		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());
		Assertions.assertEquals(List.of(AccountResumeResponseDTO.fromAccount(sheraton)), page.content());
	}

	@Test
	void testSearchWithAttentionScheduleFilter() {
		Account ypfAtalaya = new Account();
		ypfAtalaya.setEmail("ypfAtalaya@gmail.com.ar");
		ypfAtalaya.setName("YPF Atalaya");
		ypfAtalaya.setPassword("123456");
		ypfAtalaya.setLocation(new Location("Ruta 9 Kilometro 84,5, Zárate Argentina", 27.1234, 27.1234));
		ypfAtalaya.setBusinessType(BusinessType.RESTAURANT);
		ypfAtalaya.setRole(Role.BUSINESS);
		ypfAtalaya.setAttentionSchedule(new AttentionSchedule(LocalTime.of(8, 0), LocalTime.of(18, 0)));

		accountRepository.save(ypfAtalaya);

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = searchBusiness(
				baseUrl() + "/users/search/business", """
						    {
						      "attentionSchedule": {
						        "openingTime": "09:00",
						        "closingTime": "18:00"
						      }
						    }
						""", new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<AccountResumeResponseDTO> page = response.getBody();
		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());
		Assertions.assertEquals(List.of(AccountResumeResponseDTO.fromAccount(ypfAtalaya)), page.content());
	}

	@Test
	void testSearchWithRoomPacksFilter() {
		Account hiltonPilar = new Account();
		hiltonPilar.setEmail("hiltonPilar@gmail.com");
		hiltonPilar.setName("Hilton Pilar");
		hiltonPilar.setPassword("123456");
		hiltonPilar.setLocation(new Location("Ruta 8, Km 60.5, Pilar B1633 Argentina", 27.1234, 27.1234));
		hiltonPilar.setBusinessType(BusinessType.HOTEL);
		hiltonPilar.setRole(Role.BUSINESS);
		hiltonPilar.setRoomPacks(List.of(new RoomPack(LocalDate.of(2025, 11, 1), LocalDate.of(2025, 11, 5), 2,
				List.of("WiFi", "Desayuno"), 306531f,
				"Las habitaciones incluyen frigorífico y aire acondicionado, y es posible permanecer conectado, ya que hay wifi gratuito disponible, para que disfrutes de tu descanso con comodidad.",
				null)));

		accountRepository.save(hiltonPilar);

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = searchBusiness(
				baseUrl() + "/users/search/business", """
						{
						  "roomPacks": [
						    {
						      "numberOfGuests": 2,
						      "price": 306531.0
						    }
						  ]
						}
						""", new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<AccountResumeResponseDTO> page = response.getBody();
		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());
		Assertions.assertEquals(List.of(AccountResumeResponseDTO.fromAccount(hiltonPilar)), page.content());
	}

	@Test
	void testSearchUserReturnsInCorrectOrder() {
		Account fran = new Account();
		fran.setEmail("fran.infanti@gmail.com.ar");
		fran.setName("Fran Infanti");
		fran.setPassword("12345678");
		fran.setRole(Role.USER);
		fran.setFollowings(List.of("1", "2", "3"));
		fran.setFollowers(List.of("1", "2", "3"));

		Account oli = new Account();
		oli.setEmail("oli@gmail.com.ar");
		oli.setName("Oli");
		oli.setPassword("12345678");
		oli.setRole(Role.USER);
		oli.setFollowings(List.of("1"));
		oli.setFollowers(List.of("1"));

		Account jeffBezos = new Account();
		jeffBezos.setEmail("jeff.bezos@amazon.com");
		jeffBezos.setName("Jeff Bezos");
		jeffBezos.setPassword("12345678");
		jeffBezos.setRole(Role.USER);
		jeffBezos.setFollowings(List.of("1", "2", "3", "4", "5", "6"));
		jeffBezos.setFollowers(List.of("1", "2", "3", "4", "5", "6"));

		accountRepository.saveAll(List.of(oli, jeffBezos, fran));

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = searchUser(baseUrl() + "/users/search/user",
				new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<AccountResumeResponseDTO> page = response.getBody();
		Assertions.assertNotNull(page);
		Assertions.assertEquals(3, page.totalElements());
		Assertions.assertEquals(List.of(AccountResumeResponseDTO.fromAccount(jeffBezos),
				AccountResumeResponseDTO.fromAccount(fran), AccountResumeResponseDTO.fromAccount(oli)), page.content());
	}

	@Test
	void testSearchUserWithFollowersFilter() {
		Account juan = new Account();
		juan.setEmail("juan.perez@gmail.com.ar");
		juan.setName("Juan Perez");
		juan.setPassword("12345678");
		juan.setRole(Role.USER);
		juan.setFollowings(List.of("1", "2", "3"));
		juan.setFollowers(List.of("1", "2", "3", "4"));

		Account martin = new Account();
		martin.setEmail("gonzales.martin@amazon.com");
		martin.setName("Gonzales Martin");
		martin.setPassword("12345678");
		martin.setRole(Role.USER);
		martin.setFollowings(List.of("1", "2", "3"));
		martin.setFollowers(List.of("1", "2", "3", "4", "5", "6"));

		accountRepository.saveAll(List.of(martin, juan));

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = searchUser(
				baseUrl() + "/users/search/user?followers=5", new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());

		PageResponse<AccountResumeResponseDTO> page = response.getBody();
		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());
		Assertions.assertEquals(List.of(AccountResumeResponseDTO.fromAccount(martin)), page.content());
	}

	@Test
	void testSearchUserWithLocationFilter() {
		Account eltonJohn = new Account();
		eltonJohn.setEmail("eltonjohn@gmail.com");
		eltonJohn.setName("Elton John");
		eltonJohn.setPassword("12345678");
		eltonJohn.setRole(Role.USER);

		Account phillCollins = new Account();
		phillCollins.setEmail("phillcollins@gmail.com");
		phillCollins.setName("Phill Collins");
		phillCollins.setPassword("12345678");
		phillCollins.setRole(Role.USER);

		eltonJohn = accountRepository.save(eltonJohn);
		phillCollins = accountRepository.save(phillCollins);
		Publication villaParanacito = new Publication();
		villaParanacito.setTitle("Villa Paranacito");
		villaParanacito.setDescription("Hostel en Villa Paranacito, a 100 metros del Río Uruguay");
		villaParanacito.setLocation(new Location("Argentina, Villa Paranacito", 27.1234, 27.1234));
		villaParanacito.setReviews(List.of(new Review(null, null, null, null, null, eltonJohn.getId())));

		Publication sheratonPilar = new Publication();
		sheratonPilar.setTitle("Sheraton Pilar Hotel & Convention Center");
		sheratonPilar.setDescription("Desde Hilton Pilar pensamos constantemente en innovar...");
		sheratonPilar.setLocation(new Location(
				"Panamericana Km 49.5, B1629 Pilar, Provincia de Buenos Aires, Argentina", -34.4719, -58.9081));
		sheratonPilar.setReviews(List.of(new Review(null, null, null, null, null, phillCollins.getId())));

		publicationRepository.saveAll(List.of(villaParanacito, sheratonPilar));

		String searchAddress = "Panamericana";
		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = searchUser(
				baseUrl() + "/users/search/user?address=" + URLEncoder.encode(searchAddress, StandardCharsets.UTF_8),
				new ParameterizedTypeReference<>() {
				});

		assertEquals(HttpStatus.OK, response.getStatusCode());
		PageResponse<AccountResumeResponseDTO> page = response.getBody();
		Assertions.assertNotNull(page);
		Assertions.assertEquals(1, page.totalElements());
		List<String> expectedEmails = List.of(phillCollins.getEmail().toLowerCase());
		List<String> actualEmails = page.content()
			.stream()
			.map(acc -> acc.email().toLowerCase())
			.collect(Collectors.toList());
		Assertions.assertEquals(expectedEmails, actualEmails);
	}

}
