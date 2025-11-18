package com.tripmates.backend.users;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripmates.backend.common.types.Review;
import com.tripmates.backend.common.types.Role;
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
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.data.neo4j.core.Neo4jTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
@Import({ TestCloudinaryConfig.class })
public class AccountRecommendationTest {

	@LocalServerPort
	private int port;

	@Autowired
	private TestRestTemplate restTemplate;

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

	private String baseUrl() {
		return "http://localhost:" + port;
	}

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	public void testNewAccountDoesNotHaveUserAccountsRecommendations() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("franInfanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);

		accountRepository.save(fran);
		accountNodeRepository.save(AccountNode.fromAccount(fran));

		String uri = String.format("/users/recommendations/user/%s", fran.getId());

		mockMvc.perform(get(uri).contentType(MediaType.APPLICATION_JSON)).andExpect(status().isNoContent());
	}

	@Test
	@WithMockUser(username = "antonio.fuoco@gmail.com", roles = { "USER" })
	public void testAccountWithFollowsHasUserAccountsRecommendations() throws Exception {
		Account lewisHamilton = new Account();
		lewisHamilton.setName("Lewis Hamilton");
		lewisHamilton.setEmail("lewis.hamilton44@gmail.com.gb");
		lewisHamilton.setPassword("123456789");
		lewisHamilton.setRole(Role.USER);

		Account antonioFuoco = new Account();
		antonioFuoco.setName("Antonio Fuoco");
		antonioFuoco.setEmail("antonio.fuoco@gmail.com");
		antonioFuoco.setPassword("123456789");
		antonioFuoco.setRole(Role.USER);

		antonioFuoco = accountRepository.save(antonioFuoco);
		lewisHamilton = accountRepository.save(lewisHamilton);

		accountNodeRepository.save(AccountNode.fromAccount(antonioFuoco));
		accountNodeRepository.save(AccountNode.fromAccount(lewisHamilton));

		mockMvc
			.perform(post("/users/" + lewisHamilton.getId() + "/follow").with(csrf())
				.with(user(antonioFuoco.getEmail()).roles("USER")))
			.andExpect(status().isNoContent());

		String body = mockMvc
			.perform(get("/users/recommendations/user/" + antonioFuoco.getId()).contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<AccountResumeResponseDTO> accountResumeResponseDTOList = objectMapper.readValue(body,
				new TypeReference<List<AccountResumeResponseDTO>>() {
				});

		Assertions.assertEquals(1, accountResumeResponseDTOList.size());
		Assertions.assertEquals(List.of(AccountResumeResponseDTO.fromAccount(lewisHamilton)),
				accountResumeResponseDTOList);
	}

	@Test
	@WithMockUser(username = "charles.leclerc@gmail.com.ar", roles = { "USER" })
	public void testAccountThatFollowsAndUnfollowsAUserAccountsHasNoRecommendations() throws Exception {
		Account michaelJordan = new Account();
		michaelJordan.setName("Michael Jordan");
		michaelJordan.setEmail("michael.jordan@gmail.com.ar");
		michaelJordan.setPassword("123456789");
		michaelJordan.setRole(Role.USER);

		Account charlesLeclerc = new Account();
		charlesLeclerc.setName("Charles Leclerc");
		charlesLeclerc.setEmail("charles.leclerc@gmail.com.ar");
		charlesLeclerc.setPassword("123456789");
		charlesLeclerc.setRole(Role.USER);

		charlesLeclerc = accountRepository.save(charlesLeclerc);
		michaelJordan = accountRepository.save(michaelJordan);

		accountNodeRepository.save(AccountNode.fromAccount(charlesLeclerc));
		accountNodeRepository.save(AccountNode.fromAccount(michaelJordan));

		mockMvc
			.perform(post("/users/" + michaelJordan.getId() + "/follow").with(csrf())
				.with(user(charlesLeclerc.getEmail()).roles("USER")))
			.andExpect(status().isNoContent());

		mockMvc
			.perform(post("/users/" + michaelJordan.getId() + "/unfollow").with(csrf())
				.with(user(charlesLeclerc.getEmail()).roles("USER")))
			.andExpect(status().isNoContent());

		mockMvc
			.perform(get("/users/recommendations/user/" + charlesLeclerc.getId())
				.contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isNoContent());
	}

	@Test
	@WithMockUser(username = "fran.infanti@gmail.com.ar", roles = { "USER" })
	public void testAccountWithCommonReviewsHasRecommendations() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("fran.infanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);

		Account pablo = new Account();
		pablo.setName("Pablo B.");
		pablo.setEmail("pablo@gmail.com");
		pablo.setPassword("123456789");
		pablo.setRole(Role.USER);

		fran = accountRepository.save(fran);
		pablo = accountRepository.save(pablo);

		accountNodeRepository.save(AccountNode.fromAccount(fran));
		accountNodeRepository.save(AccountNode.fromAccount(pablo));

		Publication publication = new Publication();
		publication.setTitle("Rosmarie");
		publication.setDescription("Hostel in Villa Paranacito, Entre Rios");

		publication = publicationRepository.save(publication);
		publicationNodeRepository.save(PublicationNode.fromPublication(publication));

		Review franReview = new Review(publication.getId(), "Excelente lugar",
				"Muy buen lugar, salen lindos amarillos. Lastima las habitaciones", 4.5, List.of(), fran.getId());

		Review pabloReview = new Review(publication.getId(), "Excelente lugar",
				"Muy buen lugar, salen lindas taruchas y algún doradito", 5.0, List.of(), pablo.getId());

		publication.addReview(franReview);
		publication.addReview(pabloReview);
		publicationRepository.save(publication);

		accountNodeRepository.createReviewed(fran.getId(), publication.getId(), franReview.getReviewId(),
				franReview.getRating());
		accountNodeRepository.createReviewed(pablo.getId(), publication.getId(), pabloReview.getReviewId(),
				pabloReview.getRating());

		String body = mockMvc
			.perform(get("/users/recommendations/user/" + fran.getId()).contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<AccountResumeResponseDTO> accountResumeResponseDTOList = objectMapper.readValue(body,
				new TypeReference<List<AccountResumeResponseDTO>>() {
				});

		Assertions.assertEquals(1, accountResumeResponseDTOList.size());
		Assertions.assertEquals(List.of(AccountResumeResponseDTO.fromAccount(pablo)), accountResumeResponseDTOList);
	}

}
