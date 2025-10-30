package com.tripmates.backend.publication;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;

import com.tripmates.backend.config.TestCloudinaryConfig;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.*;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeAll;
import com.tripmates.backend.users.repository.mongo.AccountRespository;

import com.tripmates.backend.TestHelper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
@Import({ TestCloudinaryConfig.class })
public class PublicationControllerTests {

	@LocalServerPort
	private int port;

	private TestHelper testHelper;

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private AccountRespository userRepository;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private MongoTemplate mongoTemplate;

	private HttpHeaders headers = new HttpHeaders();

	@BeforeAll
	void setUp() {
		testHelper = new TestHelper(port, restTemplate);
	}

	@BeforeEach
	void beforeEach() {
		mongoTemplate.getDb().drop();
		restTemplate.getRestTemplate().setRequestFactory(new HttpComponentsClientHttpRequestFactory());
	}

	@Test
	void testGivenNoTitle_WhenCreatePublication_ThenShouldFailAndReturnError400() throws Exception {
		String jwt = testHelper.getJwtTesting("test@example.com");

		String requestJson = """
				{
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

		mockMvc.perform(multipart("/publications/business").file(dataPart).header("Authorization", "Bearer " + jwt))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.type").value("about:blank"))
				.andExpect(jsonPath("$.title").value("Validation Error"))
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.detail").value("title: " + ValidationErrorMessage.EMPTY_OR_NULL_FIELD))
				.andExpect(jsonPath("$.instance").value("/publications/business"))
				.andDo(print());
	}

	@Test
	void testGivenNoDescription_WhenCreatePublication_ThenShouldFailAndReturnError400() throws Exception {
		String jwt = testHelper.getJwtTesting("test@example.com");

		String requestJson = """
				{
				  "title": "Beautiful place with amazing views and full amenities.",
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

		mockMvc.perform(multipart("/publications/business").file(dataPart).header("Authorization", "Bearer " + jwt))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.type").value("about:blank"))
				.andExpect(jsonPath("$.title").value("Validation Error"))
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.detail").value("description: " + ValidationErrorMessage.EMPTY_OR_NULL_FIELD))
				.andExpect(jsonPath("$.instance").value("/publications/business"))
				.andDo(print());
	}

	@Test
	void testGivenJustDescriptionAndTitle_WhenCreatePublication_ThenShouldSuccess() throws Exception {
		String jwt = testHelper.getJwtTesting("test@example.com");

		String requestJson = """
				{
				  "title": "Beautiful place with amazing views and full amenities.",
				  "description": "Beautiful place with amazing views and full amenities."
				}
				""";

		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				requestJson.getBytes(StandardCharsets.UTF_8));
		mockMvc.perform(multipart("/publications/business").file(dataPart).header("Authorization", "Bearer " + jwt))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").isNotEmpty())
				.andExpect(jsonPath("$.title").value("Beautiful place with amazing views and full amenities."))
				.andExpect(jsonPath("$.description").value("Beautiful place with amazing views and full amenities."))
				.andExpect(jsonPath("$.openingDays").isArray())
				.andExpect(jsonPath("$.openingDays").isEmpty())
				.andExpect(jsonPath("$.attentionSchedule").value(Matchers.nullValue()))
				.andExpect(jsonPath("$.phoneNumber").value(Matchers.nullValue()))
				.andExpect(jsonPath("$.email").value(Matchers.nullValue()))
				.andExpect(jsonPath("$.location").value(Matchers.nullValue()))
				.andExpect(jsonPath("$.imageUrls").isArray())
				.andExpect(jsonPath("$.imageUrls").isEmpty())
				.andExpect(jsonPath("$.tags").isArray())
				.andExpect(jsonPath("$.tags").isEmpty())
				.andExpect(jsonPath("$.ownerId").isNotEmpty())
				.andExpect(jsonPath("$.ownerUsername").exists())
				.andExpect(jsonPath("$.createdAt").isNotEmpty())
				.andDo(print());
	}

	@Test
	void testGivenAllFieldsExceptImages_WhenCreatePublication_ThenShouldSuccess() throws Exception {
		String jwt = testHelper.getJwtTesting("test@example.com");

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
		mockMvc.perform(multipart("/publications/business").file(dataPart).header("Authorization", "Bearer " + jwt))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").isNotEmpty())
				.andExpect(jsonPath("$.title").value("Beautiful place with amazing views and full amenities."))
				.andExpect(jsonPath("$.description").value("Beautiful place with amazing views and full amenities."))
				.andExpect(jsonPath("$.openingDays").isArray())
				.andExpect(jsonPath("$.openingDays", contains("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY")))
				.andExpect(jsonPath("$.attentionSchedule.openingTime").value("09:00"))
				.andExpect(jsonPath("$.attentionSchedule.closingTime").value("18:00"))
				.andExpect(jsonPath("$.phoneNumber").value("+541112345678"))
				.andExpect(jsonPath("$.email").value("contact@hostel.com"))
				.andExpect(jsonPath("$.location").value("San Carlos de Bariloche, Argentina"))
				.andExpect(jsonPath("$.imageUrls").isArray())
				.andExpect(jsonPath("$.imageUrls").isEmpty())
				.andExpect(jsonPath("$.tags").isArray())
				.andExpect(jsonPath("$.tags", contains("hostel", "mountain", "nature")))
				.andExpect(jsonPath("$.ownerId").isNotEmpty())
				.andExpect(jsonPath("$.ownerUsername").exists())
				.andExpect(jsonPath("$.createdAt").isNotEmpty())
				.andDo(print());
	}

}