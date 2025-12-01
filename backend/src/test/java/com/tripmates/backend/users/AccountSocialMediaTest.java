package com.tripmates.backend.users;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.users.dto.account.SocialMediaUpdateResponseDTO;
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

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({ TestCloudinaryConfig.class })
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AccountSocialMediaTest {

	@LocalServerPort
	private int port;

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private AccountRepository accountRepository;

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
	@WithMockUser(username = "fran.infanti@gmail.com.ar", roles = { "USER" })
	void testCanUpdateSocialMediaLinks() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("fran.infanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);

		accountRepository.save(fran);

		String requestJSON = """
				{
				    "instagramURL": "https://www.instagram.com/Fran.Infanti"
				}
				""";

		mockMvc
			.perform(post("/users/me/media").contentType(MediaType.APPLICATION_JSON)
				.content(requestJSON)
				.with(user("fran.infanti@gmail.com.ar")))
			.andExpect(status().isNoContent());

		String body = mockMvc
			.perform(get("/users/" + fran.getEmail() + "/media").contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		SocialMediaUpdateResponseDTO socialMediaUpdateResponseDTO = objectMapper.readValue(body, new TypeReference<>() {
		});

		Assertions.assertEquals("https://www.instagram.com/Fran.Infanti", socialMediaUpdateResponseDTO.instagramURL());
		Assertions.assertNull(socialMediaUpdateResponseDTO.facebookURL());
		Assertions.assertNull(socialMediaUpdateResponseDTO.xURL());
	}

}
