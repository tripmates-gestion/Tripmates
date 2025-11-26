package com.tripmates.backend.users;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.community.dto.PlanWithPublicationsResponseDTO;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;
import com.tripmates.backend.users.entity.mongo.Account;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
@Import({ TestCloudinaryConfig.class })
public class AccountPlanTest {

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private PublicationRepository publicationRepository;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

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
	public void testCreatePlanAsUser() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("franInfanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);
		accountRepository.save(fran);

		Publication publication = new Publication();
		publication.setTitle("Fishing Trip Publication");
		publication.setDescription("Going now to Villa Paranacito");
		publicationRepository.save(publication);

		String createPlanRequest = String.format("""
				{
				  "name": "Fishing Trip 2026",
				  "description": "Going fishing to Villa Paranacito next summer 2026",
				  "publicationsIdList": ["%s"]
				}
				""", publication.getId());

		mockMvc.perform(post("/users/plans/create").contentType(MediaType.APPLICATION_JSON).content(createPlanRequest))
			.andExpect(status().isNoContent());

		mockMvc.perform(get("/community/list-plans").contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[0].name").value("Fishing Trip 2026"))
			.andExpect(jsonPath("$[0].description").value("Going fishing to Villa Paranacito next summer 2026"))
			.andExpect(jsonPath("$[0].publications[0].title").value("Fishing Trip Publication"))
			.andExpect(jsonPath("$[0].publications[0].description").value("Going now to Villa Paranacito"));
	}

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	public void testDeletePlanAsUser() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("franInfanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);
		accountRepository.save(fran);

		Publication publication = new Publication();
		publication.setTitle("Fishing Trip Publication");
		publication.setDescription("Going now to Villa Paranacito");
		publicationRepository.save(publication);

		String createPlanRequest = String.format("""
				{
				  "name": "Fishing Trip 2026",
				  "description": "Going fishing to Villa Paranacito next summer 2026",
				  "publicationsIdList": ["%s"]
				}
				""", publication.getId());

		mockMvc.perform(post("/users/plans/create").contentType(MediaType.APPLICATION_JSON).content(createPlanRequest))
			.andExpect(status().isNoContent());

		String body = mockMvc.perform(get("/community/list-plans").contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		List<PlanWithPublicationsResponseDTO> planWithPublicationsResponseDTOList = objectMapper.readValue(body,
				new TypeReference<>() {
				});

		mockMvc
			.perform(delete("/users/plans/" + planWithPublicationsResponseDTOList.getFirst().id())
				.contentType(MediaType.APPLICATION_JSON)
				.content(createPlanRequest))
			.andExpect(status().isNoContent());
	}

}
