package com.tripmates.backend.benchmark;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ActiveProfiles;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
import com.tripmates.backend.publications.dto.ReviewResponseDTO;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.mock.web.MockMultipartFile;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.BeforeAll;
import com.tripmates.backend.TestHelper;
import com.tripmates.backend.benchmarks.dto.BenchmarkItemDTO;
import com.tripmates.backend.benchmarks.dto.ChangeBenchmarkVisibilityRequestDTO;
import com.tripmates.backend.benchmarks.entity.BenchmarkProgress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import com.tripmates.backend.common.service.email.EmailService;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
@Import({ TestCloudinaryConfig.class })
public class BenchmarkTest {

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
	private PublicationResumeResponseDTO createPublication(String jwt) throws Exception {
		String requestJson = """
				{
				  "title": "NOT SO BEATUTIFUL.",
				  "description": "Beautiful place with amazing views and full amenities.",
				  "phoneNumber": "+541112345678"
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

		return new ObjectMapper().readValue(response, new TypeReference<PublicationResumeResponseDTO>() {
		});
	}

	@Test
	void testGivenNoBenchMarks_WhenGetMyBenchmarks_ThenReturnEmptyList() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("liker@example.com", BusinessType.HOTEL);

		String response = mockMvc.perform(get("/benchmarks/mine").header("Authorization", "Bearer " + jwt))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<BenchmarkProgress> benchmarks = objectMapper.readValue(response,
				new TypeReference<List<BenchmarkProgress>>() {
				});
		assertEquals(0, benchmarks.size(), "Should have 0 benchmarks");
	}

	@Test
	void testGivenOneBenchMark_WhenGetMyBenchmarks_ThenReturnOneBenchMark() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("business@example.com", BusinessType.HOTEL);
		PublicationResumeResponseDTO publication = createPublication(jwt);
		String jwtLiker = testHelper.getUserTestingJwt("liker@example.com");
		likePublication(jwtLiker, publication.id());

		String response = mockMvc.perform(get("/benchmarks/mine").header("Authorization", "Bearer " + jwt))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<BenchmarkItemDTO> benchmarks = objectMapper.readValue(response,
				new TypeReference<List<BenchmarkItemDTO>>() {
				});
		assertEquals(1, benchmarks.size(), "Should have 1 benchmark");
		assertFalse(benchmarks.get(0).visible());
		assertEquals(BenchmarkId.firstLike, benchmarks.get(0).id());
	}

	@Test
	void testGivenOneBenchMark_WhenPatchVisibility_ThenReturnPublicBenchmark() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("business@example.com", BusinessType.HOTEL);
		PublicationResumeResponseDTO publication = createPublication(jwt);
		String jwtLiker = testHelper.getUserTestingJwt("liker@example.com");
		likePublication(jwtLiker, publication.id());
		BenchmarkItemDTO updateItem = new BenchmarkItemDTO(BenchmarkId.firstLike, true);
		ChangeBenchmarkVisibilityRequestDTO changeBenchmarkVisibilityRequestDTO = new ChangeBenchmarkVisibilityRequestDTO(
				List.of(updateItem));

		String response = mockMvc
			.perform(patch("/benchmarks/mine").header("Authorization", "Bearer " + jwt)
				.content(new ObjectMapper().writeValueAsString(changeBenchmarkVisibilityRequestDTO))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<BenchmarkItemDTO> benchmarks = objectMapper.readValue(response,
				new TypeReference<List<BenchmarkItemDTO>>() {
				});
		assertEquals(1, benchmarks.size(), "Should have 1 benchmark");
		assertTrue(benchmarks.get(0).visible());
		assertEquals(BenchmarkId.firstLike, benchmarks.get(0).id());

	}

	@Test
	void testGivenTwoBenchMarks_WhenPatchVisibilityFromBoth_ThenBothArePublic() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("business@example.com", BusinessType.HOTEL);
		PublicationResumeResponseDTO publication = createPublication(jwt);
		for (String jwtLiker : testHelper.getNUserTestingJwt(20)) {
			likePublication(jwtLiker, publication.id());
		}
		BenchmarkItemDTO updateFirstLike = new BenchmarkItemDTO(BenchmarkId.firstLike, true);
		BenchmarkItemDTO updateTenLikes = new BenchmarkItemDTO(BenchmarkId.tenLikes, true);
		ChangeBenchmarkVisibilityRequestDTO changeBenchmarkVisibilityRequestDTO = new ChangeBenchmarkVisibilityRequestDTO(
				List.of(updateFirstLike, updateTenLikes));

		String response = mockMvc
			.perform(patch("/benchmarks/mine").header("Authorization", "Bearer " + jwt)
				.content(new ObjectMapper().writeValueAsString(changeBenchmarkVisibilityRequestDTO))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<BenchmarkItemDTO> benchmarks = objectMapper.readValue(response,
				new TypeReference<List<BenchmarkItemDTO>>() {
				});
		assertEquals(2, benchmarks.size(), "Should have 2 benchmark");
		assertTrue(benchmarks.get(0).visible());
		assertEquals(BenchmarkId.firstLike, benchmarks.get(0).id());
		assertTrue(benchmarks.get(1).visible());
		assertEquals(BenchmarkId.tenLikes, benchmarks.get(1).id());

	}

	@Test
	void testGivenOneBenchmarkPublicAndOnePrivate_WhenGetPublicBenchmarks_ThenJustSeeOnePublic() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("business@example.com", BusinessType.HOTEL);
		String businessId = accountRepository.findByEmail("business@example.com").get().getId();
		PublicationResumeResponseDTO publication = createPublication(jwt);
		for (String jwtLiker : testHelper.getNUserTestingJwt(20)) {
			likePublication(jwtLiker, publication.id());
		}
		BenchmarkItemDTO updateTenLikes = new BenchmarkItemDTO(BenchmarkId.tenLikes, true);
		ChangeBenchmarkVisibilityRequestDTO changeBenchmarkVisibilityRequestDTO = new ChangeBenchmarkVisibilityRequestDTO(
				List.of(updateTenLikes));

		mockMvc
			.perform(patch("/benchmarks/mine").header("Authorization", "Bearer " + jwt)
				.content(new ObjectMapper().writeValueAsString(changeBenchmarkVisibilityRequestDTO))
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		String userJwt = testHelper.getUserTestingJwt("leti@example.com");
		String response = mockMvc
			.perform(get("/benchmarks/user/" + businessId).header("Authorization", "Bearer " + userJwt))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<BenchmarkItemDTO> benchmarks = objectMapper.readValue(response,
				new TypeReference<List<BenchmarkItemDTO>>() {
				});
		assertEquals(1, benchmarks.size(), "Should have 1 benchmark");
		assertEquals(BenchmarkId.tenLikes, benchmarks.get(0).id());
	}
	@Test
	void getReviewRatingsAvg_WithTwoReviews_ShouldReturnCorrectAverage() throws Exception {
		String businessJwt = testHelper.getBusinessTestingJwt("contact@hostel.com", BusinessType.HOTEL);
		PublicationResumeResponseDTO publication = createPublication(businessJwt);
		
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
		
		String response = mockMvc.perform(get("/metrics/reviews/rating-avg")
				.header("Authorization", "Bearer " + businessJwt))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();
		
		double expectedAverage = 4.5;
		double actualAverage = Double.parseDouble(response);
		
		assertEquals(expectedAverage, actualAverage, 0.01, "Calculated average is not correct");
	}
}