package com.tripmates.backend.users;

import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRespository;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
@Import({ TestCloudinaryConfig.class })
public class AccountPlanTest {

	@LocalServerPort
	private int port;

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private AccountRespository accountRespository;

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

	private String baseUrl() {
		return "http://localhost:" + port;
	}

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	public void testCreatePlanAsUser() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("franInfanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);
		accountRespository.save(fran);

		String createPlanRequest = """
				{
				  "name": "Fishing Trip 2026",
				  "description": "Going fishing to Villa Paranacito next summer 2026"
				}
				""";

		mockMvc.perform(post("/users/plans/create").contentType(MediaType.APPLICATION_JSON).content(createPlanRequest))
			.andExpect(status().isNoContent());

		String expectedResponse = """
				[
				    {
				      "name": "Fishing Trip 2026",
				      "description": "Going fishing to Villa Paranacito next summer 2026",
				      "publications": []
				    }
				]
				""";

		mockMvc.perform(get("/users/plans/list").contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(content().contentType("application/json"))
			.andExpect(content().json(expectedResponse, false));
	}

}
