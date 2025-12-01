package com.tripmates.backend.metrics;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ActiveProfiles;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
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
	void testGivenNoPublications_WhenGetMostLikedsPublications_ThenReturnEmptyList() throws Exception {
		String response = mockMvc.perform(get("/metrics/n-most-likeds-publications"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<PublicationResumeResponseDTO> publications = objectMapper.readValue(response,
				new TypeReference<List<PublicationResumeResponseDTO>>() {
				});
		assertEquals(0, publications.size(), "Should have 0 publications");
	}

	@Test
	void testGivenOnePublication_WhenGetMostLikedsPublications_ThenReturnOnePublication() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("business@example.com", BusinessType.HOTEL);
		PublicationResumeResponseDTO publication = createPublication(jwt, "Amazing Hotel");
		String jwtLiker = testHelper.getUserTestingJwt("liker@example.com");
		likePublication(jwtLiker, publication.id());

		String response = mockMvc.perform(get("/metrics/n-most-likeds-publications"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<PublicationResumeResponseDTO> publications = objectMapper.readValue(response,
				new TypeReference<List<PublicationResumeResponseDTO>>() {
				});
		assertEquals(1, publications.size(), "Should have 1 publication");
		assertEquals(publication.id(), publications.get(0).id());
		assertEquals("Amazing Hotel", publications.get(0).title());
	}

	@Test
	void testGivenMultiplePublications_WhenGetMostLikedsPublications_ThenReturnTop3InOrder() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("business@example.com", BusinessType.HOTEL);

		// Create 5 publications with different number of likes
		PublicationResumeResponseDTO pub1 = createPublication(jwt, "Publication 1");
		PublicationResumeResponseDTO pub2 = createPublication(jwt, "Publication 2");
		PublicationResumeResponseDTO pub3 = createPublication(jwt, "Publication 3");
		PublicationResumeResponseDTO pub4 = createPublication(jwt, "Publication 4");
		PublicationResumeResponseDTO pub5 = createPublication(jwt, "Publication 5");

		// Generate all user JWTs at once (5 + 3 + 4 + 1 + 2 = 15 users)
		List<String> allLikers = testHelper.getNUserTestingJwt(15);
		int index = 0;

		// Give them different amounts of likes
		// pub1: 5 likes (most liked)
		for (int i = 0; i < 5; i++) {
			likePublication(allLikers.get(index++), pub1.id());
		}

		// pub2: 3 likes (3rd most liked)
		for (int i = 0; i < 3; i++) {
			likePublication(allLikers.get(index++), pub2.id());
		}

		// pub3: 4 likes (should be 2nd)
		for (int i = 0; i < 4; i++) {
			likePublication(allLikers.get(index++), pub3.id());
		}

		// pub4: 1 like
		likePublication(allLikers.get(index++), pub4.id());

		// pub5: 2 likes (4th most liked)
		for (int i = 0; i < 2; i++) {
			likePublication(allLikers.get(index++), pub5.id());
		}

		String response = mockMvc.perform(get("/metrics/n-most-likeds-publications"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<PublicationResumeResponseDTO> publications = objectMapper.readValue(response,
				new TypeReference<List<PublicationResumeResponseDTO>>() {
				});

		assertEquals(3, publications.size(), "Should return exactly 3 publications");
		assertEquals(pub1.id(), publications.get(0).id(), "First should be publication with 5 likes");
		assertEquals(pub3.id(), publications.get(1).id(), "Second should be publication with 4 likes");
		assertEquals(pub2.id(), publications.get(2).id(), "Third should be publication with 3 likes");
	}

	@Test
	void testGivenMultiplePublications_WhenGetMostLikedsPublicationsWithCustomN_ThenReturnTopN() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("business@example.com", BusinessType.HOTEL);

		// Create 5 publications
		PublicationResumeResponseDTO pub1 = createPublication(jwt, "Publication 1");
		PublicationResumeResponseDTO pub2 = createPublication(jwt, "Publication 2");
		PublicationResumeResponseDTO pub3 = createPublication(jwt, "Publication 3");
		PublicationResumeResponseDTO pub4 = createPublication(jwt, "Publication 4");
		PublicationResumeResponseDTO pub5 = createPublication(jwt, "Publication 5");

		// Generate all user JWTs at once (5 + 4 + 3 + 2 + 1 = 15 users)
		List<String> allLikers = testHelper.getNUserTestingJwt(15);
		int index = 0;

		// Give them likes in descending order
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
		String response = mockMvc.perform(get("/metrics/n-most-likeds-publications").param("n", "5"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<PublicationResumeResponseDTO> publications = objectMapper.readValue(response,
				new TypeReference<List<PublicationResumeResponseDTO>>() {
				});

		assertEquals(5, publications.size(), "Should return exactly 5 publications");
		assertEquals(pub1.id(), publications.get(0).id());
		assertEquals(pub2.id(), publications.get(1).id());
		assertEquals(pub3.id(), publications.get(2).id());
		assertEquals(pub4.id(), publications.get(3).id());
		assertEquals(pub5.id(), publications.get(4).id());
	}

	@Test
	void testGivenPublicationsWithNoLikes_WhenGetMostLikedsPublications_ThenReturnPublicationsWithZeroLikes()
			throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("business@example.com", BusinessType.HOTEL);

		// Create 2 publications without likes
		PublicationResumeResponseDTO pub1 = createPublication(jwt, "Publication 1");
		PublicationResumeResponseDTO pub2 = createPublication(jwt, "Publication 2");

		String response = mockMvc.perform(get("/metrics/n-most-likeds-publications"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<PublicationResumeResponseDTO> publications = objectMapper.readValue(response,
				new TypeReference<List<PublicationResumeResponseDTO>>() {
				});

		assertEquals(2, publications.size(), "Should return 2 publications");
		assertTrue(publications.stream().anyMatch(p -> p.id().equals(pub1.id())));
		assertTrue(publications.stream().anyMatch(p -> p.id().equals(pub2.id())));
	}

	@Test
	void testGivenFewerPublicationsThanN_WhenGetMostLikedsPublications_ThenReturnAllPublications() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("business@example.com", BusinessType.HOTEL);

		// Create only 2 publications but request top 5
		PublicationResumeResponseDTO pub1 = createPublication(jwt, "Publication 1");
		PublicationResumeResponseDTO pub2 = createPublication(jwt, "Publication 2");

		// Generate all user JWTs at once (3 + 1 = 4 users)
		List<String> allLikers = testHelper.getNUserTestingJwt(4);
		int index = 0;

		for (int i = 0; i < 3; i++) {
			likePublication(allLikers.get(index++), pub1.id());
		}
		likePublication(allLikers.get(index++), pub2.id());

		String response = mockMvc.perform(get("/metrics/n-most-likeds-publications").param("n", "5"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<PublicationResumeResponseDTO> publications = objectMapper.readValue(response,
				new TypeReference<List<PublicationResumeResponseDTO>>() {
				});

		assertEquals(2, publications.size(), "Should return only 2 publications (all available)");
		assertEquals(pub1.id(), publications.get(0).id(), "Publication with more likes should be first");
		assertEquals(pub2.id(), publications.get(1).id());
	}

	@Test
	void testGivenPublicationsFromDifferentBusinesses_WhenGetMostLikedsPublications_ThenReturnFromAllBusinesses()
			throws Exception {
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

		String response = mockMvc.perform(get("/metrics/n-most-likeds-publications"))
			.andExpect(status().isOk())
			.andDo(print())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<PublicationResumeResponseDTO> publications = objectMapper.readValue(response,
				new TypeReference<List<PublicationResumeResponseDTO>>() {
				});

		assertEquals(2, publications.size(), "Should return publications from both businesses");
		assertEquals(pub2.id(), publications.get(0).id(), "Restaurant publication should be first (more likes)");
		assertEquals(pub1.id(), publications.get(1).id(), "Hotel publication should be second");
	}

}
