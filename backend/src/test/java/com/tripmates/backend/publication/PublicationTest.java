package com.tripmates.backend.publication;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripmates.backend.TestHelper;
import com.tripmates.backend.common.types.AttentionSchedule;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;
import com.tripmates.backend.users.dto.account.AccountResumeResponseDTO;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.MediaType;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({ TestCloudinaryConfig.class })
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class PublicationTest {

	@LocalServerPort
	private int port;

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private PublicationRepository publicationRepository;

	@Autowired
	private MockMvc mockMvc;

	private TestHelper testHelper;

	@BeforeAll
	void setUp() {
		testHelper = new TestHelper(port, restTemplate);
	}

	@BeforeEach
	void beforeEach() {
		mongoTemplate.getDb().drop();
		restTemplate.getRestTemplate().setRequestFactory(new HttpComponentsClientHttpRequestFactory());
	}

	@AfterAll
	void afterAll() {
		mongoTemplate.getDb().drop();
	}

	private PublicationResumeResponseDTO createPublication(String userTestingJwt) throws Exception {
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

		String body = mockMvc
			.perform(multipart("/publications/business").file(dataPart)
				.header("Authorization", "Bearer " + userTestingJwt))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		return objectMapper.readValue(body, PublicationResumeResponseDTO.class);
	}

	@Test
	void testCanObtainPublicationsAfterBeingCreated() throws Exception {
		String userTestingJwt = testHelper.getUserTestingJwt("contact@hostel.com");

		Publication publication = new Publication();
		publication.setTitle("Beautiful place with amazing views and full amenities.");
		publication.setDescription("Beautiful place with amazing views and full amenities.");
		publication.setPhoneNumber("+541112345678");
		publication.setEmail("contact@hostel.com");
		publication.setLocation("San Carlos de Bariloche, Argentina");
		publication.setOpeningDays(List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
				DayOfWeek.FRIDAY));
		publication.setAttentionSchedule(new AttentionSchedule(LocalTime.of(9, 0), LocalTime.of(18, 0)));
		publication.setExceptionalClosingDays(List.of(LocalDate.of(2025, 12, 25), LocalDate.of(2025, 1, 1)));
		publication.setTags(List.of("hostel", "mountain", "nature"));

		List<PublicationResumeResponseDTO> expectedPublicationResumeResponseDTOList = List
			.of(PublicationResumeResponseDTO.fromPublication(publication));

		createPublication(userTestingJwt);

		String body = mockMvc
			.perform(get("/publications/mine").accept(MediaType.APPLICATION_JSON)
				.header("Authorization", "Bearer " + userTestingJwt))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<PublicationResumeResponseDTO> publicationResumeResponseDTOList = objectMapper.readValue(body,
				new TypeReference<List<PublicationResumeResponseDTO>>() {
				});

		Assertions.assertEquals(1, publicationResumeResponseDTOList.size());

		PublicationResumeResponseDTO expectedPublicationResumeResponseDTO = expectedPublicationResumeResponseDTOList
			.getFirst();
		PublicationResumeResponseDTO publicationResumeResponseDTO = publicationResumeResponseDTOList.getFirst();

		Assertions.assertAll(
				() -> Assertions.assertEquals(expectedPublicationResumeResponseDTO.title(),
						publicationResumeResponseDTO.title()),
				() -> Assertions.assertEquals(expectedPublicationResumeResponseDTO.description(),
						publicationResumeResponseDTO.description()),
				() -> Assertions.assertEquals(expectedPublicationResumeResponseDTO.phoneNumber(),
						publicationResumeResponseDTO.phoneNumber()),
				() -> Assertions.assertEquals(expectedPublicationResumeResponseDTO.email(),
						publicationResumeResponseDTO.email()),
				() -> Assertions.assertEquals(expectedPublicationResumeResponseDTO.location(),
						publicationResumeResponseDTO.location()),
				() -> Assertions.assertEquals(expectedPublicationResumeResponseDTO.openingDays(),
						publicationResumeResponseDTO.openingDays()),
				() -> Assertions.assertEquals(expectedPublicationResumeResponseDTO.attentionSchedule(),
						publicationResumeResponseDTO.attentionSchedule()),
				() -> Assertions.assertEquals(expectedPublicationResumeResponseDTO.exceptionalClosingDays(),
						publicationResumeResponseDTO.exceptionalClosingDays()),
				() -> Assertions.assertEquals(expectedPublicationResumeResponseDTO.tags(),
						publicationResumeResponseDTO.tags()));
	}

	@Test
	void testCanDeleteAnExistingPublication() throws Exception {
		String userTestingJwt = testHelper.getUserTestingJwt("contact@hostel.com");

		PublicationResumeResponseDTO publicationResumeResponseDTO = createPublication(userTestingJwt);

		mockMvc
			.perform(delete("/publications/" + publicationResumeResponseDTO.id()).accept(MediaType.APPLICATION_JSON)
				.header("Authorization", "Bearer " + userTestingJwt))
			.andExpect(status().isNoContent());

		mockMvc
			.perform(get("/publications/mine").accept(MediaType.APPLICATION_JSON)
				.header("Authorization", "Bearer " + userTestingJwt))
			.andExpect(status().isOk());
	}

	@Test
	void testCanUpdateAnExistingPublication() throws Exception {
		String userTestingJwt = testHelper.getUserTestingJwt("contact@hostel.com");

		PublicationResumeResponseDTO publicationResumeResponseDTO = createPublication(userTestingJwt);

		String requestJson = """
				{
				  "description": "This is a beautiful place with amazing views and full amenities."
				}
				""";

		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				requestJson.getBytes(StandardCharsets.UTF_8));

		String body = mockMvc
			.perform(multipart("/publications/" + publicationResumeResponseDTO.id()).file(dataPart).with(request -> {
				request.setMethod("PATCH");
				return request;
			}).header("Authorization", "Bearer " + userTestingJwt))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		PublicationResumeResponseDTO gotPublicationResumeResponseDTO = objectMapper.readValue(body,
				PublicationResumeResponseDTO.class);

		Assertions.assertAll(
				() -> Assertions.assertEquals(publicationResumeResponseDTO.title(),
						gotPublicationResumeResponseDTO.title()),
				() -> Assertions.assertEquals("This is a beautiful place with amazing views and full amenities.",
						gotPublicationResumeResponseDTO.description()),
				() -> Assertions.assertEquals(publicationResumeResponseDTO.phoneNumber(),
						gotPublicationResumeResponseDTO.phoneNumber()),
				() -> Assertions.assertEquals(publicationResumeResponseDTO.email(),
						gotPublicationResumeResponseDTO.email()),
				() -> Assertions.assertEquals(publicationResumeResponseDTO.location(),
						gotPublicationResumeResponseDTO.location()),
				() -> Assertions.assertEquals(publicationResumeResponseDTO.openingDays(),
						gotPublicationResumeResponseDTO.openingDays()),
				() -> Assertions.assertEquals(publicationResumeResponseDTO.attentionSchedule(),
						gotPublicationResumeResponseDTO.attentionSchedule()),
				() -> Assertions.assertEquals(publicationResumeResponseDTO.exceptionalClosingDays(),
						gotPublicationResumeResponseDTO.exceptionalClosingDays()),
				() -> Assertions.assertEquals(publicationResumeResponseDTO.tags(),
						gotPublicationResumeResponseDTO.tags()));
	}

}
