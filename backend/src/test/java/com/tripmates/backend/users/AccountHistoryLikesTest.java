package com.tripmates.backend.users;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripmates.backend.common.types.Like;
import com.tripmates.backend.common.types.Location;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;
import com.tripmates.backend.users.dto.account.AccountResumeResponseDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({ TestCloudinaryConfig.class })
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AccountHistoryLikesTest {

	@LocalServerPort
	private int port;

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private PublicationRepository publicationRepository;

	@Autowired
	private MockMvc mockMvc;

	@BeforeEach
	void beforeEach() {
		mongoTemplate.getDb().drop();
	}

	@AfterAll
	void afterAll() {
		mongoTemplate.getDb().drop();
	}

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	void testUserThatMadeNoLikesHasNoHistory() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("franInfanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);

		accountRepository.save(fran);

		Publication publication = new Publication();
		publication.setTitle("Rosmarie");
		publication.setDescription("Hostel in Villa Paranacito, Entre Rios");
		publication.setLocation(new Location("Islas del Ibicuy, Entre Rios", -33.4475, -58.4864));

		publicationRepository.save(publication);

		mockMvc.perform(get("/users/history/likes/" + fran.getId()).contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isNoContent());

	}

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	void testUserThatMadeLikesHasHistory() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("franInfanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);

		accountRepository.save(fran);

		Publication rosmariePublication = new Publication();
		rosmariePublication.setTitle("Rosmarie");
		rosmariePublication.setDescription("Hostel in Villa Paranacito, Entre Rios");
		rosmariePublication.setLocation(new Location("Islas del Ibicuy, Entre Rios", -33.4475, -58.4864));
		rosmariePublication.setLikes(List.of(new Like(fran.getId(), new Date(0))));

		Publication hiltonPilarPublication = new Publication();
		hiltonPilarPublication.setTitle("Hilton Pilar");
		hiltonPilarPublication.setDescription("Super luxury hilton pilar");
		hiltonPilarPublication.setLocation(new Location("Ruta 8, Km 60.5, Pilar B1633 Argentina", -34.4719, -58.9117));
		hiltonPilarPublication.setLikes(List.of(new Like(fran.getId(), new Date())));

		publicationRepository.saveAll(List.of(rosmariePublication, hiltonPilarPublication));

		String body = mockMvc
			.perform(get("/users/history/likes/" + fran.getId()).contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<PublicationResumeResponseDTO> publicationResumeResponseDTOList = objectMapper.readValue(body,
				new TypeReference<List<PublicationResumeResponseDTO>>() {
				});

		Assertions.assertEquals(2, publicationResumeResponseDTOList.size());
		Assertions.assertEquals(
				List.of(PublicationResumeResponseDTO.fromPublication(hiltonPilarPublication),
						PublicationResumeResponseDTO.fromPublication(rosmariePublication)),
				publicationResumeResponseDTOList);
	}

}
