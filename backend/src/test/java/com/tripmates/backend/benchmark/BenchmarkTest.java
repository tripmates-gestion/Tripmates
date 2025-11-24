package com.tripmates.backend.benchmark;



import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ActiveProfiles;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.springframework.mock.web.MockMultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.BeforeAll;
import com.tripmates.backend.TestHelper;
import com.tripmates.backend.benchmarks.dto.BenchmarkItemDTO;
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
	void testGivenNoBenchMarks_WhenGetMyBenchmarks_ThenReturnEmptyList() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("liker@example.com", BusinessType.HOTEL);

		String response = mockMvc.perform(get("/benchmarks/mine").header("Authorization", "Bearer " + jwt))
				.andExpect(status().isOk())
				.andDo(print())
				.andReturn()
				.getResponse()
				.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<BenchmarkProgress> benchmarks = objectMapper.readValue(response, new TypeReference<List<BenchmarkProgress>>() {});
		assertEquals(0, benchmarks.size(), "Should have 0 benchmarks");
	}

  @Test
	void testGivenOneBenchMark_WhenGetMyBenchmarks_ThenReturnOneBenchMark() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("business@example.com", BusinessType.HOTEL);
    PublicationResumeResponseDTO publication = createPublication(jwt);
    String jwtLiker =testHelper.getUserTestingJwt("liker@example.com");
    likePublication(jwtLiker, publication.id());

		String response = mockMvc.perform(get("/benchmarks/mine").header("Authorization", "Bearer " + jwt))
				.andExpect(status().isOk())
				.andDo(print())
				.andReturn()
				.getResponse()
				.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<BenchmarkItemDTO> benchmarks = objectMapper.readValue(response, new TypeReference<List<BenchmarkItemDTO>>() {});
		assertEquals(1, benchmarks.size(), "Should have 1 benchmark");
    assertFalse(benchmarks.get(0).visible());
    assertEquals(BenchmarkId.firstLike, benchmarks.get(0).id());
	}

  private void likePublication(String jwt, String publicationId) throws Exception {
    mockMvc.perform(post("/publications/" + publicationId + "/like").header("Authorization", "Bearer " + jwt))
      .andExpect(status().isNoContent())
      .andDo(print());
  }

  private PublicationResumeResponseDTO createPublication(String jwt) throws Exception {
    		String requestJson = """
				{
				  "title": "Beautiful place with amazing views and full amenities.",
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
        
    return new ObjectMapper().readValue(response, new TypeReference<PublicationResumeResponseDTO>() {});
  }
}