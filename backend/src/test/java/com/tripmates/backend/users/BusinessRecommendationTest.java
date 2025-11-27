package com.tripmates.backend.users;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.types.Like;
import com.tripmates.backend.common.types.Review;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.types.Location;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.publications.entity.neo4j.PublicationNode;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;
import com.tripmates.backend.publications.repository.neo4j.PublicationNodeRepository;
import com.tripmates.backend.users.dto.account.AccountResumeResponseDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.entity.neo4j.AccountNode;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.users.repository.neo4j.AccountNodeRepository;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
@Import({ TestCloudinaryConfig.class })
public class BusinessRecommendationTest {

	private Location createLocation(String address, Double latitude, Double longitude) {
		return new Location(address, latitude, longitude);
	}

	@LocalServerPort
	private int port;

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private Neo4jClient neo4jClient;

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private PublicationRepository publicationRepository;

	@Autowired
	private AccountNodeRepository accountNodeRepository;

	@Autowired
	private PublicationNodeRepository publicationNodeRepository;

	@Autowired
	private MockMvc mockMvc;

	@BeforeEach
	void beforeEach() {
		mongoTemplate.getDb().drop();
		neo4jClient.query("MATCH (n) DETACH DELETE n").run();
	}

	@AfterAll
	void afterAll() {
		mongoTemplate.getDb().drop();
		neo4jClient.query("MATCH (n) DETACH DELETE n").run();
	}

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	public void testAccountWithoutReviewsAndLikesHasNoBusinessRecommendations() throws Exception {
		// Arrange
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
		accountNodeRepository.saveAll(List.of(AccountNode.fromAccount(fran), AccountNode.fromAccount(carlos)));

		Publication publication = new Publication();
		publication.setTitle("Rosmarie");
		publication.setDescription("Hostel in Villa Paranacito, Entre Rios");
		publication.setLocation(createLocation("Islas del Ibicuy, Entre Rios", -33.4475, -58.4864));

		publicationRepository.save(publication);
		publicationNodeRepository.save(PublicationNode.fromPublication(publication));

		String uri = String.format("/users/recommendations/business/%s", fran.getId());

		mockMvc.perform(get(uri).contentType(MediaType.APPLICATION_JSON)).andExpect(status().isNoContent());
	}

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	public void testAccountWithLikesHasBusinessRecommendations() throws Exception {
		// Arrange
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

		Account hiltonPilar = new Account();
		hiltonPilar.setName("Hilton Pilar");
		hiltonPilar.setEmail("hiltonPilar@gmail.com");
		hiltonPilar.setPassword("123456");
		hiltonPilar.setLocation(createLocation("Ruta 8, Km 60.5, Pilar B1633 Argentina", -34.4732, -58.8746));
		hiltonPilar.setRole(Role.BUSINESS);
		hiltonPilar.setBusinessType(BusinessType.HOTEL);

		accountRepository.saveAll(List.of(fran, carlos, hiltonPilar));
		accountNodeRepository.saveAll(List.of(AccountNode.fromAccount(fran), AccountNode.fromAccount(carlos),
				AccountNode.fromAccount(hiltonPilar)));

		accountNodeRepository.createSharesBusinessType(carlos.getId());
		accountNodeRepository.createSharesBusinessType(hiltonPilar.getId());

		Publication publication = new Publication();
		publication.setOwnerId(carlos.getId());
		publication.setTitle("Rosmarie");
		publication.setDescription("Hostel in Villa Paranacito, Entre Rios");
		publication.setLocation(createLocation("Islas del Ibicuy, Entre Rios", -33.4475, -58.4864));
		publication.setLikes(List.of(new Like(fran.getId(), new Date())));

		publicationRepository.save(publication);
		publicationNodeRepository.save(PublicationNode.fromPublication(publication));

		accountNodeRepository.createOwnsPublication(carlos.getId(), publication.getId());
		accountNodeRepository.createLiked(fran.getId(), publication.getId());

		String body = mockMvc
			.perform(get("/users/recommendations/business/" + fran.getId()).contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<AccountResumeResponseDTO> accountResumeResponseDTOList = objectMapper.readValue(body,
				new TypeReference<List<AccountResumeResponseDTO>>() {
				});

		Assertions.assertEquals(1, accountResumeResponseDTOList.size());
		Assertions.assertEquals(List.of(AccountResumeResponseDTO.fromAccount(hiltonPilar)),
				accountResumeResponseDTOList);
	}

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	public void testAccountWithReviewsHasBusinessRecommendations() throws Exception {
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

		Account hiltonPilar = new Account();
		hiltonPilar.setName("Hilton Pilar");
		hiltonPilar.setEmail("hiltonPilar@gmail.com");
		hiltonPilar.setPassword("123456");
		hiltonPilar.setLocation(createLocation("Ruta 8, Km 60.5, Pilar B1633 Argentina", -34.4732, -58.8746));
		hiltonPilar.setRole(Role.BUSINESS);
		hiltonPilar.setBusinessType(BusinessType.HOTEL);

		accountRepository.saveAll(List.of(fran, carlos, hiltonPilar));
		accountNodeRepository.saveAll(List.of(AccountNode.fromAccount(fran), AccountNode.fromAccount(carlos),
				AccountNode.fromAccount(hiltonPilar)));

		accountNodeRepository.createSharesBusinessType(carlos.getId());
		accountNodeRepository.createSharesBusinessType(hiltonPilar.getId());

		Publication publication = new Publication();
		publication.setOwnerId(carlos.getId());
		publication.setTitle("Rosmarie");
		publication.setDescription("Hostel in Villa Paranacito, Entre Rios");
		publication.setLocation(createLocation("Islas del Ibicuy, Entre Rios", -33.4475, -58.4864));

		publicationRepository.save(publication);
		publicationNodeRepository.save(PublicationNode.fromPublication(publication));

		accountNodeRepository.createOwnsPublication(carlos.getId(), publication.getId());

		Review franReview = new Review(publication.getId(), "Excelente lugar",
				"Muy buen lugar, salen lindos amarillos. Lastima las habitaciones", 4.5, List.of(), fran.getId());

		publication.addReview(franReview);
		publicationRepository.save(publication);
		accountNodeRepository.createReviewed(fran.getId(), publication.getId(), franReview.getReviewId(),
				franReview.getRating());

		String body = mockMvc
			.perform(get("/users/recommendations/business/" + fran.getId()).contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<AccountResumeResponseDTO> accountResumeResponseDTOList = objectMapper.readValue(body,
				new TypeReference<List<AccountResumeResponseDTO>>() {
				});

		Assertions.assertEquals(1, accountResumeResponseDTOList.size());
		Assertions.assertEquals(List.of(AccountResumeResponseDTO.fromAccount(hiltonPilar)),
				accountResumeResponseDTOList);
	}

}
