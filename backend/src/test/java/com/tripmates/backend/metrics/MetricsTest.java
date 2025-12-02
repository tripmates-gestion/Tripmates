package com.tripmates.backend.metrics;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ActiveProfiles;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
import com.tripmates.backend.publications.dto.ReviewResponseDTO;
import com.tripmates.backend.users.dto.account.AccountResumeResponseDTO;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.common.types.BusinessType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.mock.web.MockMultipartFile;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.BeforeAll;
import com.tripmates.backend.TestHelper;
import java.nio.charset.StandardCharsets;
import java.util.List;
import com.tripmates.backend.common.service.email.EmailService;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
@Import({ TestCloudinaryConfig.class })
public class MetricsTest {

	@LocalServerPort
	private int port;

	private TestHelper testHelper;

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private AccountRepository accountRepository;

	@MockBean
	private EmailService emailService;

	ObjectMapper objectMapper;

	@BeforeAll
	void setUp() {
		objectMapper = new ObjectMapper();
		testHelper = new TestHelper(port, restTemplate);
	}

	@BeforeEach
	void beforeEach() {
		mongoTemplate.getDb().drop();
		restTemplate.getRestTemplate().setRequestFactory(new HttpComponentsClientHttpRequestFactory());
	}

	private void likePublication(String jwt, String publicationId) throws Exception {
		mockMvc.perform(post("/publications/" + publicationId + "/like").header("Authorization", "Bearer " + jwt))
			.andExpect(status().isNoContent())
			.andDo(print());
	}

	private ReviewResponseDTO createReview(String publicationId, String userAccountTestingJwt, String reviewJson)
			throws Exception {
		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				reviewJson.getBytes(StandardCharsets.UTF_8));

		String body = mockMvc
			.perform(multipart("/publications/" + publicationId + "/review").file(dataPart).with(request -> {
				request.setMethod("POST");
				return request;
			}).header("Authorization", "Bearer " + userAccountTestingJwt))
			.andExpect(status().isCreated())
			.andReturn()
			.getResponse()
			.getContentAsString();

		return objectMapper.readValue(body, ReviewResponseDTO.class);
	}

	private PublicationResumeResponseDTO createPublication(String jwt, String title) throws Exception {
		String requestJson = String.format("""
				{
				  "title": "%s",
				  "description": "Beautiful place with amazing views and full amenities.",
				  "phoneNumber": "+541112345678"
				}
				""", title);

		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				requestJson.getBytes(StandardCharsets.UTF_8));
		String response = mockMvc
			.perform(multipart("/publications/business").file(dataPart).header("Authorization", "Bearer " + jwt))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		return objectMapper.readValue(response, new TypeReference<PublicationResumeResponseDTO>() {
		});
	}

	@Test
	void testGivenNoBusinessAccounts_WhenGetMostLikedAccounts_ThenReturnEmptyList() throws Exception {
		String response = mockMvc.perform(get("/metrics/n-most-likeds-accounts"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<AccountResumeResponseDTO> accounts = objectMapper.readValue(response,
				new TypeReference<List<AccountResumeResponseDTO>>() {
				});
		assertEquals(0, accounts.size(), "Should have 0 business accounts");
	}

	@Test
	void testGivenOneBusinessAccountWithLikes_WhenGetMostLikedAccounts_ThenReturnOneAccount() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("business@example.com", BusinessType.HOTEL);
		PublicationResumeResponseDTO publication = createPublication(jwt, "Amazing Hotel");
		String jwtLiker = testHelper.getUserTestingJwt("liker@example.com");
		likePublication(jwtLiker, publication.id());

		String response = mockMvc.perform(get("/metrics/n-most-likeds-accounts"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<AccountResumeResponseDTO> accounts = objectMapper.readValue(response,
				new TypeReference<List<AccountResumeResponseDTO>>() {
				});
		assertEquals(1, accounts.size(), "Should have 1 business account");
		assertEquals("business@example.com", accounts.get(0).email());
		assertEquals(BusinessType.HOTEL, accounts.get(0).businessType());
	}

	@Test
	void testGivenMultipleBusinessAccounts_WhenGetMostLikedAccounts_ThenReturnTop3InOrder() throws Exception {
		String jwt1 = testHelper.getBusinessTestingJwt("business1@example.com", BusinessType.HOTEL);
		String jwt2 = testHelper.getBusinessTestingJwt("business2@example.com", BusinessType.RESTAURANT);
		String jwt3 = testHelper.getBusinessTestingJwt("business3@example.com", BusinessType.HOTEL);
		String jwt4 = testHelper.getBusinessTestingJwt("business4@example.com", BusinessType.RESTAURANT);
		String jwt5 = testHelper.getBusinessTestingJwt("business5@example.com", BusinessType.HOTEL);

		PublicationResumeResponseDTO pub1 = createPublication(jwt1, "Business 1 Publication");
		PublicationResumeResponseDTO pub2 = createPublication(jwt2, "Business 2 Publication");
		PublicationResumeResponseDTO pub3 = createPublication(jwt3, "Business 3 Publication");
		PublicationResumeResponseDTO pub4 = createPublication(jwt4, "Business 4 Publication");
		PublicationResumeResponseDTO pub5 = createPublication(jwt5, "Business 5 Publication");

		List<String> allLikers = testHelper.getNUserTestingJwt(15);
		int index = 0;

		for (int i = 0; i < 5; i++) {
			likePublication(allLikers.get(index++), pub1.id());
		}

		for (int i = 0; i < 3; i++) {
			likePublication(allLikers.get(index++), pub2.id());
		}

		for (int i = 0; i < 4; i++) {
			likePublication(allLikers.get(index++), pub3.id());
		}

		likePublication(allLikers.get(index++), pub4.id());

		for (int i = 0; i < 2; i++) {
			likePublication(allLikers.get(index++), pub5.id());
		}

		String response = mockMvc.perform(get("/metrics/n-most-likeds-accounts"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<AccountResumeResponseDTO> accounts = objectMapper.readValue(response,
				new TypeReference<List<AccountResumeResponseDTO>>() {
				});

		assertEquals(3, accounts.size(), "Should return exactly 3 business accounts");
		assertEquals("business1@example.com", accounts.get(0).email(), "First should be business with 5 likes");
		assertEquals("business3@example.com", accounts.get(1).email(), "Second should be business with 4 likes");
		assertEquals("business2@example.com", accounts.get(2).email(), "Third should be business with 3 likes");
	}

	@Test
	void testGivenMultipleBusinessAccounts_WhenGetMostLikedAccountsWithCustomN_ThenReturnTopN() throws Exception {
		// Create 5 business accounts
		String jwt1 = testHelper.getBusinessTestingJwt("business1@example.com", BusinessType.HOTEL);
		String jwt2 = testHelper.getBusinessTestingJwt("business2@example.com", BusinessType.RESTAURANT);
		String jwt3 = testHelper.getBusinessTestingJwt("business3@example.com", BusinessType.HOTEL);
		String jwt4 = testHelper.getBusinessTestingJwt("business4@example.com", BusinessType.RESTAURANT);
		String jwt5 = testHelper.getBusinessTestingJwt("business5@example.com", BusinessType.HOTEL);

		// Create publications
		PublicationResumeResponseDTO pub1 = createPublication(jwt1, "Publication 1");
		PublicationResumeResponseDTO pub2 = createPublication(jwt2, "Publication 2");
		PublicationResumeResponseDTO pub3 = createPublication(jwt3, "Publication 3");
		PublicationResumeResponseDTO pub4 = createPublication(jwt4, "Publication 4");
		PublicationResumeResponseDTO pub5 = createPublication(jwt5, "Publication 5");

		List<String> allLikers = testHelper.getNUserTestingJwt(15);
		int index = 0;

		for (int i = 0; i < 5; i++) {
			likePublication(allLikers.get(index++), pub1.id());
		}
		for (int i = 0; i < 4; i++) {
			likePublication(allLikers.get(index++), pub2.id());
		}
		for (int i = 0; i < 3; i++) {
			likePublication(allLikers.get(index++), pub3.id());
		}
		for (int i = 0; i < 2; i++) {
			likePublication(allLikers.get(index++), pub4.id());
		}
		for (int i = 0; i < 1; i++) {
			likePublication(allLikers.get(index++), pub5.id());
		}

		// Request top 5
		String response = mockMvc.perform(get("/metrics/n-most-likeds-accounts").param("n", "5"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<AccountResumeResponseDTO> accounts = objectMapper.readValue(response,
				new TypeReference<List<AccountResumeResponseDTO>>() {
				});

		assertEquals(5, accounts.size(), "Should return exactly 5 business accounts");
		assertEquals("business1@example.com", accounts.get(0).email());
		assertEquals("business2@example.com", accounts.get(1).email());
		assertEquals("business3@example.com", accounts.get(2).email());
		assertEquals("business4@example.com", accounts.get(3).email());
		assertEquals("business5@example.com", accounts.get(4).email());
	}

	@Test
	void testGivenBusinessAccountsWithNoLikes_WhenGetMostLikedAccounts_ThenReturnAccountsWithZeroLikes()
			throws Exception {
		String jwt1 = testHelper.getBusinessTestingJwt("business1@example.com", BusinessType.HOTEL);
		String jwt2 = testHelper.getBusinessTestingJwt("business2@example.com", BusinessType.RESTAURANT);

		createPublication(jwt1, "Publication 1");
		createPublication(jwt2, "Publication 2");

		String response = mockMvc.perform(get("/metrics/n-most-likeds-accounts"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<AccountResumeResponseDTO> accounts = objectMapper.readValue(response,
				new TypeReference<List<AccountResumeResponseDTO>>() {
				});

		assertEquals(2, accounts.size(), "Should return 2 business accounts");
		assertTrue(accounts.stream().anyMatch(a -> a.email().equals("business1@example.com")));
		assertTrue(accounts.stream().anyMatch(a -> a.email().equals("business2@example.com")));
	}

	@Test
	void testGivenFewerBusinessAccountsThanN_WhenGetMostLikedAccounts_ThenReturnAllAccounts() throws Exception {
		String jwt1 = testHelper.getBusinessTestingJwt("business1@example.com", BusinessType.HOTEL);
		String jwt2 = testHelper.getBusinessTestingJwt("business2@example.com", BusinessType.RESTAURANT);

		PublicationResumeResponseDTO pub1 = createPublication(jwt1, "Publication 1");
		PublicationResumeResponseDTO pub2 = createPublication(jwt2, "Publication 2");

		List<String> allLikers = testHelper.getNUserTestingJwt(4);
		int index = 0;

		for (int i = 0; i < 3; i++) {
			likePublication(allLikers.get(index++), pub1.id());
		}
		likePublication(allLikers.get(index++), pub2.id());

		String response = mockMvc.perform(get("/metrics/n-most-likeds-accounts").param("n", "5"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<AccountResumeResponseDTO> accounts = objectMapper.readValue(response,
				new TypeReference<List<AccountResumeResponseDTO>>() {
				});

		assertEquals(2, accounts.size(), "Should return only 2 business accounts (all available)");
		assertEquals("business1@example.com", accounts.get(0).email(), "Business with more likes should be first");
		assertEquals("business2@example.com", accounts.get(1).email());
	}

	@Test
	void testGivenDifferentBusinessTypes_WhenGetMostLikedAccounts_ThenReturnAccountsFromAllTypes() throws Exception {
		String jwt1 = testHelper.getBusinessTestingJwt("business1@example.com", BusinessType.HOTEL);
		String jwt2 = testHelper.getBusinessTestingJwt("business2@example.com", BusinessType.RESTAURANT);
		PublicationResumeResponseDTO pub1 = createPublication(jwt1, "Hotel Publication");
		PublicationResumeResponseDTO pub2 = createPublication(jwt2, "Restaurant Publication");
		List<String> allLikers = testHelper.getNUserTestingJwt(7);

		for (int i = 0; i < 5; i++) {
			likePublication(allLikers.get(i), pub2.id());
		}
		for (int i = 5; i < 7; i++) {
			likePublication(allLikers.get(i), pub1.id());
		}

		String response = mockMvc.perform(get("/metrics/n-most-likeds-accounts"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<AccountResumeResponseDTO> accounts = objectMapper.readValue(response,
				new TypeReference<List<AccountResumeResponseDTO>>() {
				});

		assertEquals(2, accounts.size(), "Should return business accounts from both types");
		assertEquals("business2@example.com", accounts.get(0).email(),
				"Restaurant account should be first (more likes)");
		assertEquals("business1@example.com", accounts.get(1).email(), "Hotel account should be second");
	}

	@Test
	void getReviewRatingsAvg_WithTwoReviews_ShouldReturnCorrectAverage() throws Exception {
		String businessJwt = testHelper.getBusinessTestingJwt("contact@hostel.com", BusinessType.HOTEL);
		PublicationResumeResponseDTO publication = createPublication(businessJwt, "SO BEATUTIFUL.");

		String user1Jwt = testHelper.getUserTestingJwt("fran.infanti@gmail.com.ar");
		String user2Jwt = testHelper.getUserTestingJwt("lewis.hamilton44@gmail.com.gb");

		String review1Json = """
				{
					"title": "Great place!",
					"content": "Had a wonderful time here.",
					"rating": 4.0
				}
				""";

		String review2Json = """
				{
					"title": "Excellent!",
					"content": "Best experience ever!",
					"rating": 5.0
				}
				""";

		createReview(publication.id(), user1Jwt, review1Json);
		createReview(publication.id(), user2Jwt, review2Json);

		String businessId = accountRepository.findByEmail("contact@hostel.com").get().getId();

		String response = mockMvc
			.perform(get("/metrics/reviews/rating-avg/" + businessId).header("Authorization", "Bearer " + businessJwt))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		double expectedAverage = 4.5;
		double actualAverage = Double.parseDouble(response);

		assertEquals(expectedAverage, actualAverage, 0.01, "Calculated average is not correct");
	}

}
