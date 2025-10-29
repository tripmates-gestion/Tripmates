package com.tripmates.backend.publication;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.config.TestSecurityConfig;

import java.nio.charset.StandardCharsets;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.tripmates.backend.common.types.AttentionSchedule;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;

import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;

import org.junit.jupiter.api.BeforeAll;
import com.tripmates.backend.users.repository.mongo.UserRepository;

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
	private UserRepository userRepository;

	@Autowired
	private MockMvc mockMvc;

	private HttpHeaders headers = new HttpHeaders();

	@BeforeAll
	void setUp() {
		testHelper = new TestHelper(port, restTemplate);
	}

	@BeforeEach
	void beforeEach() {
		userRepository.deleteAll();
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

		// 🔹 Construir la parte JSON como un “archivo” (sin nombre)
		MockMultipartFile dataPart = new MockMultipartFile("data", // nombre del campo
																	// esperado
				"", // nombre del archivo (vacío)
				"application/json", // content-type
				requestJson.getBytes(StandardCharsets.UTF_8));

		// 🔹 Ejecutar la request multipart
		mockMvc.perform(multipart("/publications/business").file(dataPart).header("Authorization", "Bearer " + jwt))
			.andExpect(status().isBadRequest())
			.andDo(print()); // imprime la request y response completas
	}

}