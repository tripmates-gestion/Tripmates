package com.tripmates.backend.publication;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ActiveProfiles;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.common.types.BenchmarkId;
import com.tripmates.backend.common.types.BusinessType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.springframework.mock.web.MockMultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.BeforeAll;
import com.tripmates.backend.TestHelper;
import com.tripmates.backend.benchmarks.entity.BenchmarkProgress;
import com.tripmates.backend.benchmarks.repository.BenchmarkRepository;

import java.nio.charset.StandardCharsets;
import java.util.List;

import com.tripmates.backend.common.service.email.EmailService;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
@Import({ TestCloudinaryConfig.class })
public class LikePublicationTest {

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

	@Autowired
	private BenchmarkRepository benchmarkRepository;

	@MockBean
	private EmailService emailService;

	@BeforeAll
	void setUp() {
		testHelper = new TestHelper(port, restTemplate);
	}

	@BeforeEach
	void beforeEach() {
		mongoTemplate.getDb().drop();
		restTemplate.getRestTemplate().setRequestFactory(new HttpComponentsClientHttpRequestFactory());
	}

	@Test
	void testGivenNonExistentPublication_WhenUserLikesIt_ThenReturn404() throws Exception {
		String jwt = testHelper.getUserTestingJwt("liker@example.com");

		mockMvc.perform(post("/publications/non-existent-id/like").header("Authorization", "Bearer " + jwt))
				.andExpect(status().isNotFound());
	}

	@Test
	void testGivenPublication_WhenUserLikesIt_ThenTheGlobalNumberTotalLikesShouldIncreaseAlsoHistoricMaxNumberTotalLikesShouldIncreaseAndBenchmarkShouldBeSaved()
			throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("test@example.com", BusinessType.HOTEL);

		String requestJson = """
				{
				  "title": "Beautiful place with amazing views and full amenities.",
				  "description": "Beautiful place with amazing views and full amenities.",
				  "phoneNumber": "+541112345678",
				  "email": "contact@hostel.com",
				  "location": "San Carlos de Bariloche, Argentina",
				  "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
				  "attentionSchedule": {
				      "openingTime": "09:00",
				      "closingTime": "18:00"
				  },
				  "exceptionalClosingDays": ["2025-12-25", "2025-01-01"],
				  "tags": ["hostel", "mountain", "nature"]
				}
				""";

		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				requestJson.getBytes(StandardCharsets.UTF_8));
		String response = mockMvc
				.perform(multipart("/publications/business").file(dataPart).header("Authorization", "Bearer " + jwt))
				.andExpect(status().isOk())
				.andDo(print())
				.andReturn()
				.getResponse()
				.getContentAsString();

		String publicationId = new ObjectMapper().readTree(response).get("id").asText();
		String ownerId = new ObjectMapper().readTree(response).get("ownerId").asText();

		String jwtLiker = testHelper.getUserTestingJwt("liker@example.com");

		mockMvc.perform(post("/publications/" + publicationId + "/like").header("Authorization", "Bearer " + jwtLiker))
				.andExpect(status().isNoContent())
				.andDo(print());

		Account updatedOwner = accountRepository.findById(ownerId).orElseThrow();
		assertEquals(1, updatedOwner.getNumberTotalLikes(), "Owner's total likes should increase by 1");
		assertEquals(1, updatedOwner.getHistoricMaxNumberTotalLikes(),
				"Owner's historic max total likes should increase by 1");

		List<BenchmarkProgress> benchmarks = benchmarkRepository.findByUserId(ownerId);
		assertEquals(1, benchmarks.size(), "Should have 1 benchmark");
		BenchmarkProgress updatedBenchmark = benchmarks.get(0);
		assertEquals(BenchmarkId.firstLike, updatedBenchmark.getBenchmarkId(), "Owner's benchmark should be firstLike");
	}

	@Test
	void testGivenBusinessAccountWithPublications_ThenTheGlobalNumberTotalLikesIsZero() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("test@example.com", BusinessType.HOTEL);

		String publication1CreationRequestJson = """
				{
				  "title": "Beautiful place with amazing views and full amenities.",
				  "description": "Beautiful place with amazing views and full amenities.",
				  "phoneNumber": "+541112345678",
				  "email": "contact@hostel.com",
				  "location": "San Carlos de Bariloche, Argentina",
				  "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
				  "attentionSchedule": {
				      "openingTime": "09:00",
				      "closingTime": "18:00"
				  },
				  "exceptionalClosingDays": ["2025-12-25", "2025-01-01"],
				  "tags": ["hostel", "mountain", "nature"]
				}
				""";

		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				publication1CreationRequestJson.getBytes(StandardCharsets.UTF_8));
		String response = mockMvc
				.perform(multipart("/publications/business").file(dataPart).header("Authorization", "Bearer " + jwt))
				.andExpect(status().isOk())
				.andDo(print())
				.andReturn()
				.getResponse()
				.getContentAsString();

		String publication2CreationRequestJson = """
				{
				  "title": "Are you ok?",
				  "description": "Are you ok? rest here.",
				  "phoneNumber": "+541112345678",
				  "email": "contact@hostel.com",
				  "exceptionalClosingDays": ["2025-12-25", "2025-01-01"],
				  "tags": ["hostel", "relax"]
				}
				""";

		MockMultipartFile dataPart2 = new MockMultipartFile("data", "", "application/json",
				publication2CreationRequestJson.getBytes(StandardCharsets.UTF_8));
		mockMvc.perform(multipart("/publications/business").file(dataPart2).header("Authorization", "Bearer " + jwt))
				.andExpect(status().isOk())
				.andDo(print());
		String ownerId = new ObjectMapper().readTree(response).get("ownerId").asText();
		Account updatedOwner = accountRepository.findById(ownerId).orElseThrow();
		assertEquals(0, updatedOwner.getNumberTotalLikes(), "Owner's total likes should be 0");
	}

	@Test
	void testGivenBusinessAccountWithLikes_ThenTheGlobalNumberTotalLikesDecreasesButHistoricMaxNumberTotalLikesDoesNotChangeAlsoIsStillThere()
			throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("test@example.com", BusinessType.HOTEL);

		String publication1CreationRequestJson = """
				{
				  "title": "Beautiful place with amazing views and full amenities.",
				  "description": "Beautiful place with amazing views and full amenities.",
				  "phoneNumber": "+541112345678",
				  "email": "contact@hostel.com",
				  "location": "San Carlos de Bariloche, Argentina",
				  "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
				  "attentionSchedule": {
				      "openingTime": "09:00",
				      "closingTime": "18:00"
				  },
				  "exceptionalClosingDays": ["2025-12-25", "2025-01-01"],
				  "tags": ["hostel", "mountain", "nature"]
				}
				""";

		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				publication1CreationRequestJson.getBytes(StandardCharsets.UTF_8));
		String response = mockMvc
				.perform(multipart("/publications/business").file(dataPart).header("Authorization", "Bearer " + jwt))
				.andExpect(status().isOk())
				.andDo(print())
				.andReturn()
				.getResponse()
				.getContentAsString();
		String ownerId = new ObjectMapper().readTree(response).get("ownerId").asText();
		String publicationId = new ObjectMapper().readTree(response).get("id").asText();

		String jwtLiker = testHelper.getUserTestingJwt("liker@example.com");
		mockMvc.perform(post("/publications/" + publicationId + "/like").header("Authorization", "Bearer " + jwtLiker))
				.andExpect(status().isNoContent())
				.andDo(print());
		mockMvc
				.perform(post("/publications/" + publicationId + "/unlike").header("Authorization",
						"Bearer " + jwtLiker))
				.andExpect(status().isNoContent())
				.andDo(print());

		Account updatedOwner = accountRepository.findById(ownerId).orElseThrow();
		assertEquals(0, updatedOwner.getNumberTotalLikes(), "Owner's total likes should be 0");
		assertEquals(1, updatedOwner.getHistoricMaxNumberTotalLikes(), "Owner's historic max total likes should be 1");
		List<BenchmarkProgress> benchmarks = benchmarkRepository.findByUserId(ownerId);
		assertEquals(1, benchmarks.size(), "Should have 1 benchmark");
		BenchmarkProgress updatedBenchmark = benchmarks.get(0);
		assertEquals(BenchmarkId.firstLike, updatedBenchmark.getBenchmarkId(), "Owner's benchmark should be firstLike");
	}

	@Test
	void givenBusinessPublication_WhenAdd9likes_ThenTheGlobalNumberTotalLikesAndMaxNumberTotalLikesAre9OnlyHavingFirstLikeBenchmark()
			throws Exception {
		String jwtBusiness = testHelper.getBusinessTestingJwt("test@example.com", BusinessType.HOTEL);

		String publicationCreationRequestJson = """
				{
				  "title": "Beautiful place with amazing views and full amenities.",
				  "description": "Beautiful place with amazing views and full amenities.",
				  "phoneNumber": "+541112345678",
				  "email": "contact@hostel.com",
				  "location": "San Carlos de Bariloche, Argentina",
				  "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
				  "attentionSchedule": {
				      "openingTime": "09:00",
				      "closingTime": "18:00"
				  },
				  "exceptionalClosingDays": ["2025-12-25", "2025-01-01"],
				  "tags": ["hostel", "mountain", "nature"]
				}
				""";

		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				publicationCreationRequestJson.getBytes(StandardCharsets.UTF_8));
		String response = mockMvc
				.perform(
						multipart("/publications/business").file(dataPart).header("Authorization", "Bearer " + jwtBusiness))
				.andExpect(status().isOk())
				.andDo(print())
				.andReturn()
				.getResponse()
				.getContentAsString();

		String ownerId = new ObjectMapper().readTree(response).get("ownerId").asText();
		String publicationId = new ObjectMapper().readTree(response).get("id").asText();

		List<String> jwtLikers = testHelper.getNUserTestingJwt(9);
		for(String jwtLiker:jwtLikers)
		{
			mockMvc.perform(post("/publications/" + publicationId + "/like").header("Authorization", "Bearer " + jwtLiker))
				.andExpect(status().isNoContent())
				.andDo(print());
			}

		Account updatedOwner = accountRepository.findById(ownerId).orElseThrow();

		assertEquals(9, updatedOwner.getNumberTotalLikes(), "Owner's total likes should be 9");
		assertEquals(9, updatedOwner.getHistoricMaxNumberTotalLikes(), "Owner's historic max total likes should be 9");
		List<BenchmarkProgress> benchmarks = benchmarkRepository.findByUserId(ownerId);
		assertEquals(1, benchmarks.size(), "Should have 1 benchmark");
		BenchmarkProgress updatedBenchmark = benchmarks.get(0);
		assertEquals(BenchmarkId.firstLike, updatedBenchmark.getBenchmarkId(), "Owner's benchmark should be firstLike");
	}
  @Test
	void givenBusinessPublication_WhenAdd10likes_ThenTheGlobalNumberTotalLikesAndMaxNumberTotalLikesAre10Having2Benchmarks()
			throws Exception {
		String jwtBusiness = testHelper.getBusinessTestingJwt("test@example.com", BusinessType.HOTEL);

		String publicationCreationRequestJson = """
				{
				  "title": "Beautiful place with amazing views and full amenities.",
				  "description": "Beautiful place with amazing views and full amenities.",
				  "phoneNumber": "+541112345678",
				  "email": "contact@hostel.com",
				  "location": "San Carlos de Bariloche, Argentina",
				  "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
				  "attentionSchedule": {
				      "openingTime": "09:00",
				      "closingTime": "18:00"
				  },
				  "exceptionalClosingDays": ["2025-12-25", "2025-01-01"],
				  "tags": ["hostel", "mountain", "nature"]
				}
				""";

		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				publicationCreationRequestJson.getBytes(StandardCharsets.UTF_8));
		String response = mockMvc
				.perform(
						multipart("/publications/business").file(dataPart).header("Authorization", "Bearer " + jwtBusiness))
				.andExpect(status().isOk())
				.andDo(print())
				.andReturn()
				.getResponse()
				.getContentAsString();

		String ownerId = new ObjectMapper().readTree(response).get("ownerId").asText();
		String publicationId = new ObjectMapper().readTree(response).get("id").asText();

		List<String> jwtLikers = testHelper.getNUserTestingJwt(10);
		for(String jwtLiker:jwtLikers)
		{
			mockMvc.perform(post("/publications/" + publicationId + "/like").header("Authorization", "Bearer " + jwtLiker))
				.andExpect(status().isNoContent())
				.andDo(print());
			}

		Account updatedOwner = accountRepository.findById(ownerId).orElseThrow();

		assertEquals(10, updatedOwner.getNumberTotalLikes(), "Owner's total likes should be 10");
		assertEquals(10, updatedOwner.getHistoricMaxNumberTotalLikes(), "Owner's historic max total likes should be 10");
		List<BenchmarkProgress> benchmarks = benchmarkRepository.findByUserId(ownerId);
		assertEquals(2, benchmarks.size(), "Should have 2 benchmarks");
		BenchmarkProgress updatedBenchmark = benchmarks.get(0);
		assertEquals(BenchmarkId.firstLike, updatedBenchmark.getBenchmarkId(), "Owner's benchmark should be firstLike");
    BenchmarkProgress updatedBenchmark2 = benchmarks.get(1);
		assertEquals(BenchmarkId.tenLikes, updatedBenchmark2.getBenchmarkId(), "Owner's benchmark should be tenLikes");
	}

  
}