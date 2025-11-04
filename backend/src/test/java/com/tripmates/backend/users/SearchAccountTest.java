package com.tripmates.backend.users;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tripmates.backend.common.types.*;
import com.tripmates.backend.common.types.MenuItem;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.config.TestSecurityConfig;
import com.tripmates.backend.users.dto.AccountResumeResponseDTO;
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
import org.springframework.http.*;
import org.springframework.lang.Nullable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.util.UriComponentsBuilder;
// import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.LocalTime;
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
	private AccountRespository accountRespository;

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

	private <T> ResponseEntity<T> post(String url, @Nullable String requestBody,
			ParameterizedTypeReference<T> responseType) {

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		HttpEntity<String> entity = requestBody != null ? new HttpEntity<>(requestBody, headers)
				: new HttpEntity<>(headers);

		return restTemplate.exchange(url, HttpMethod.POST, entity, responseType);
	}

	@Test
	void testSearchWithFiltersButWithNoUsers() {
	}

	@Test
	void testSearchWithNoneFilters() {
		Account kansas = new Account();
		kansas.setEmail("kansas@gmail.com.ar");
		kansas.setName("Kansas");
		kansas.setPassword("123456789");
		kansas.setBusinessType(BusinessType.RESTAURANT);
		kansas.setRole(Role.BUSINESS);

		accountRespository.saveAll(List.of(kansas));

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = post(baseUrl() + "/users/search/business",
				"{}", new ParameterizedTypeReference<>() {
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

		accountRespository.saveAll(List.of(sigaLaVaca, pfchang, rosmarie));

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = post(baseUrl() + "/users/search/business",
				"{ \"businessType\": \"RESTAURANT\" }", new ParameterizedTypeReference<>() {
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

		accountRespository.saveAll(List.of(mcDonalds, burgerKing));

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = post(baseUrl() + "/users/search/business", """
				    {
				      "location": "Buenos Aires, Martinez Unicenter"
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
		wendys.setLocation("England, London");
		wendys.setBusinessType(BusinessType.RESTAURANT);
		wendys.setRole(Role.BUSINESS);

		Account hutch = new Account();
		hutch.setEmail("hutch@gmail.com.ar");
		hutch.setName("Hutch");
		hutch.setPassword("123456789");
		hutch.setLocation("Ciudad Jardin, Lomas del Palomar");
		hutch.setBusinessType(BusinessType.RESTAURANT);
		hutch.setRole(Role.BUSINESS);

		accountRespository.saveAll(List.of(wendys, hutch));

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = post(baseUrl() + "/users/search/business", """
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
		sheraton.setLocation("Panamericana Km 49.5, B1629 Pilar, Provincia de Buenos Aires");
		sheraton.setBusinessType(BusinessType.HOTEL);
		sheraton.setAveragePrice(AveragePrice.$$$);
		sheraton.setRole(Role.BUSINESS);

		Account graff = new Account();
		graff.setEmail("graff@gmail.com.ar");
		graff.setName("Graff");
		graff.setPassword("123456789");
		graff.setLocation("Ciudad Jardin, Lomas del Palomar");
		graff.setBusinessType(BusinessType.RESTAURANT);
		graff.setAveragePrice(AveragePrice.$);
		graff.setRole(Role.BUSINESS);

		accountRespository.saveAll(List.of(sheraton, graff));

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = post(baseUrl() + "/users/search/business", """
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
		ypfAtalaya.setLocation("Ruta 9 Kilometro 84,5, Zárate Argentina");
		ypfAtalaya.setBusinessType(BusinessType.RESTAURANT);
		ypfAtalaya.setRole(Role.BUSINESS);
		ypfAtalaya.setAttentionSchedule(new AttentionSchedule(LocalTime.of(8, 0), LocalTime.of(18, 0)));

		accountRespository.saveAll(List.of(ypfAtalaya));

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = post(baseUrl() + "/users/search/business", """
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
		hiltonPilar.setLocation("Ruta 8, Km 60.5, Pilar B1633 Argentina");
		hiltonPilar.setBusinessType(BusinessType.HOTEL);
		hiltonPilar.setRole(Role.BUSINESS);
		hiltonPilar.setRoomPacks(List.of(new RoomPack(LocalDate.of(2025, 11, 1), LocalDate.of(2025, 11, 5), 2,
				List.of("WiFi", "Desayuno"), 306531f,
				"Las habitaciones incluyen frigorífico y aire acondicionado, y es posible permanecer conectado, ya que hay wifi gratuito disponible, para que disfrutes de tu descanso con comodidad.",
				null)));

		accountRespository.saveAll(List.of(hiltonPilar));

		ResponseEntity<PageResponse<AccountResumeResponseDTO>> response = post(baseUrl() + "/users/search/business", """
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
	void testSearchWithMultipleFilters() {
	}

}
