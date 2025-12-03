package com.tripmates.backend.publication;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripmates.backend.common.service.email.EmailService;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.types.Location;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.config.TestStorageConfig;
import com.tripmates.backend.publications.dto.ReviewResponseDTO;
import com.tripmates.backend.publications.dto.ReviewsListDTO;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;
import com.tripmates.backend.publications.repository.mongo.ReviewRepository;
import com.tripmates.backend.publications.repository.neo4j.PublicationNodeRepository;
import com.tripmates.backend.users.dto.account.AccountResumeResponseDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.users.repository.neo4j.AccountNodeRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({ TestCloudinaryConfig.class })
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ReviewTest {

	@LocalServerPort
	private int port;

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private PublicationRepository publicationRepository;

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private EmailService emailService;

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

	private Location createLocation(String address, Double latitude, Double longitude) {
		return new Location(address, latitude, longitude);
	}

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	void testCanCreateAReviewFromAPublication() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("franInfanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);

		Account carlos = new Account();
		carlos.setName("Carlos");
		carlos.setEmail("carlos@gmail.com");
		carlos.setPassword("123456789");
		carlos.setRole(Role.BUSINESS);
		carlos.setBusinessType(BusinessType.HOTEL);

		accountRepository.saveAll(List.of(fran, carlos));

		Publication publication = new Publication();
		publication.setOwnerId(carlos.getId());
		publication.setTitle("Rosmarie");
		publication.setDescription("Hostel in Villa Paranacito, Entre Rios");
		publication.setLocation(createLocation("Islas del Ibicuy, Entre Rios", -33.4475, -58.4864));

		publicationRepository.save(publication);

		String reviewCreationRequestDTO = """
				{
				  "title": "Excelente lugar",
				  "content": "Muy buen lugar, salen lindos amarillos. Lastima las aranias que hay.",
				  "rating": 2.0
				}
				""";

		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				reviewCreationRequestDTO.getBytes(StandardCharsets.UTF_8));

		mockMvc
			.perform(multipart("/publications/" + publication.getId() + "/review").file(dataPart)
				.contentType(MediaType.MULTIPART_FORM_DATA)
				.with(user("franInfanti@gmail.com.ar")))
			.andExpect(status().isCreated());

		String body = mockMvc.perform(get("/publications/users/" + fran.getId() + "/reviews"))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<ReviewResponseDTO> reviewResponseDTOList = objectMapper
			.readValue(body, new TypeReference<ReviewsListDTO>() {
			})
			.reviews();

		Assertions.assertEquals(1, reviewResponseDTOList.size());

		ReviewResponseDTO reviewResponseDTO = reviewResponseDTOList.getFirst();
		Assertions.assertEquals("Excelente lugar", reviewResponseDTO.title());
		Assertions.assertEquals("Muy buen lugar, salen lindos amarillos. Lastima las aranias que hay.",
				reviewResponseDTO.content());
		Assertions.assertEquals(2.0, reviewResponseDTO.rating());
		Assertions.assertTrue(reviewResponseDTO.mentions().isEmpty());
	}

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	void testCanMentionAUserInAReview() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("franInfanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);

		Account pablo = new Account();
		pablo.setName("Pablo");
		pablo.setEmail("pablo@gmail.com.ar");
		pablo.setPassword("123456789");
		pablo.setRole(Role.USER);

		Account carlos = new Account();
		carlos.setName("Carlos");
		carlos.setEmail("carlos@gmail.com");
		carlos.setPassword("123456789");
		carlos.setRole(Role.BUSINESS);
		carlos.setBusinessType(BusinessType.HOTEL);

		accountRepository.saveAll(List.of(fran, pablo, carlos));

		Publication publication = new Publication();
		publication.setOwnerId(carlos.getId());
		publication.setTitle("Rosmarie");
		publication.setDescription("Hostel in Villa Paranacito, Entre Rios");
		publication.setLocation(createLocation("Islas del Ibicuy, Entre Rios", -33.4475, -58.4864));

		publicationRepository.save(publication);

		String reviewCreationRequestDTO = """
				{
				  "title": "Excelente lugar",
				  "content": "Muy buen lugar, salen lindos amarillos. Lastima las aranias que hay. Cuando volvemos @pablo@gmail.com.ar ?",
				  "rating": 2.0,
				  "mentions": ["pablo@gmail.com.ar"]
				}
				""";

		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				reviewCreationRequestDTO.getBytes(StandardCharsets.UTF_8));

		mockMvc
			.perform(multipart("/publications/" + publication.getId() + "/review").file(dataPart)
				.contentType(MediaType.MULTIPART_FORM_DATA)
				.with(user("franInfanti@gmail.com.ar")))
			.andExpect(status().isCreated());

		String body = mockMvc.perform(get("/publications/users/" + fran.getId() + "/reviews"))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<ReviewResponseDTO> reviewResponseDTOList = objectMapper
			.readValue(body, new TypeReference<ReviewsListDTO>() {
			})
			.reviews();

		Assertions.assertEquals(1, reviewResponseDTOList.size());

		ReviewResponseDTO reviewResponseDTO = reviewResponseDTOList.getFirst();
		Assertions.assertEquals("Excelente lugar", reviewResponseDTO.title());
		Assertions.assertEquals(
				"Muy buen lugar, salen lindos amarillos. Lastima las aranias que hay. Cuando volvemos @pablo@gmail.com.ar ?",
				reviewResponseDTO.content());
		Assertions.assertEquals(2.0, reviewResponseDTO.rating());
		Assertions.assertEquals(List.of(pablo.getEmail()), reviewResponseDTO.mentions());
	}

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	void testCanNotMentionAUserThatDoesNotExistInAReview() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("franInfanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);

		Account carlos = new Account();
		carlos.setName("Carlos");
		carlos.setEmail("carlos@gmail.com");
		carlos.setPassword("123456789");
		carlos.setRole(Role.BUSINESS);
		carlos.setBusinessType(BusinessType.HOTEL);

		accountRepository.saveAll(List.of(fran, carlos));

		Publication publication = new Publication();
		publication.setOwnerId(carlos.getId());
		publication.setTitle("Rosmarie");
		publication.setDescription("Hostel in Villa Paranacito, Entre Rios");
		publication.setLocation(createLocation("Islas del Ibicuy, Entre Rios", -33.4475, -58.4864));

		publicationRepository.save(publication);

		String reviewCreationRequestDTO = """
				{
				  "title": "Excelente lugar",
				  "content": "Muy buen lugar, salen lindos amarillos. Lastima las aranias que hay. Cuando volvemos @pablo@gmail.com.ar ?",
				  "rating": 2.0,
				  "mentions": ["pablo@gmail.com.ar"]
				}
				""";

		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				reviewCreationRequestDTO.getBytes(StandardCharsets.UTF_8));

		mockMvc
			.perform(multipart("/publications/" + publication.getId() + "/review").file(dataPart)
				.contentType(MediaType.MULTIPART_FORM_DATA)
				.with(user("franInfanti@gmail.com.ar")))
			.andExpect(status().isNotFound());

		String body = mockMvc.perform(get("/publications/users/" + fran.getId() + "/reviews"))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<ReviewResponseDTO> reviewResponseDTOList = objectMapper
			.readValue(body, new TypeReference<ReviewsListDTO>() {
			})
			.reviews();

		Assertions.assertEquals(0, reviewResponseDTOList.size());
	}

}
