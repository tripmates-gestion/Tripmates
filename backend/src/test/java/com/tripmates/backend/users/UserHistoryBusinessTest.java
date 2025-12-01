package com.tripmates.backend.users;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.users.dto.account.AccountResumeResponseDTO;
import com.tripmates.backend.users.dto.account.ViewedBusinessResponseDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.*;
import org.springframework.lang.Nullable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Import({ TestCloudinaryConfig.class })
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class UserHistoryBusinessTest {

	@LocalServerPort
	private int port;

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private MockMvc mockMvc;

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

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	void testUserWithNoViewedBusinessAccountsHasNoHistory() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("franInfanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);

		accountRepository.save(fran);

		mockMvc
			.perform(get("/users/history/view/business").contentType(MediaType.APPLICATION_JSON)
				.with(user("franInfanti@gmail.com.ar")))
			.andExpect(status().isNoContent());
	}

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	void testUserWithViewedBusinessAccountsHasHistory() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("franInfanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);

		Account kansas = new Account();
		kansas.setEmail("kansas@gmail.com.ar");
		kansas.setName("Kansas");
		kansas.setPassword("123456789");
		kansas.setBusinessType(BusinessType.RESTAURANT);
		kansas.setRole(Role.BUSINESS);

		accountRepository.saveAll(List.of(fran, kansas));

		mockMvc.perform(post("/users/view/business/" + kansas.getId()).contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isNoContent());

		String body = mockMvc
			.perform(get("/users/history/view/business").contentType(MediaType.APPLICATION_JSON)
				.with(user("franInfanti@gmail.com.ar")))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<ViewedBusinessResponseDTO> viewedBusinessResponseDTOList = objectMapper.readValue(body,
				new TypeReference<List<ViewedBusinessResponseDTO>>() {
				});

		Assertions.assertEquals(1, viewedBusinessResponseDTOList.size());
		Assertions.assertEquals(AccountResumeResponseDTO.fromAccount(kansas),
				viewedBusinessResponseDTOList.getFirst().accountResumeResponseDTO());
	}

	@Test
	@WithMockUser(username = "franInfanti@gmail.com.ar", roles = { "USER" })
	void testUserWithMultipleViewedBusinessAccountsHasHistory() throws Exception {
		Account fran = new Account();
		fran.setName("Fran Infanti");
		fran.setEmail("franInfanti@gmail.com.ar");
		fran.setPassword("123456789");
		fran.setRole(Role.USER);

		Account kansas = new Account();
		kansas.setName("Kansas");
		kansas.setEmail("kansas@gmail.com.ar");
		kansas.setPassword("123456789");
		kansas.setBusinessType(BusinessType.RESTAURANT);
		kansas.setRole(Role.BUSINESS);

		Account pfchan = new Account();
		pfchan.setName("Pfchan");
		pfchan.setEmail("pfchan@gmail.com.ch");
		pfchan.setPassword("123456789");
		pfchan.setBusinessType(BusinessType.RESTAURANT);
		pfchan.setRole(Role.BUSINESS);

		accountRepository.saveAll(List.of(fran, kansas, pfchan));

		mockMvc.perform(post("/users/view/business/" + kansas.getId()).contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isNoContent());

		mockMvc.perform(post("/users/view/business/" + pfchan.getId()).contentType(MediaType.APPLICATION_JSON))
			.andExpect(status().isNoContent());

		String body = mockMvc
			.perform(get("/users/history/view/business").contentType(MediaType.APPLICATION_JSON)
				.with(user("franInfanti@gmail.com.ar")))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		ObjectMapper objectMapper = new ObjectMapper();
		List<ViewedBusinessResponseDTO> viewedBusinessResponseDTOList = objectMapper.readValue(body,
				new TypeReference<List<ViewedBusinessResponseDTO>>() {
				});

		Assertions.assertEquals(2, viewedBusinessResponseDTOList.size());

		Assertions.assertEquals(AccountResumeResponseDTO.fromAccount(pfchan),
				viewedBusinessResponseDTOList.getFirst().accountResumeResponseDTO());

		Assertions.assertEquals(AccountResumeResponseDTO.fromAccount(kansas),
				viewedBusinessResponseDTOList.getLast().accountResumeResponseDTO());
	}

}
