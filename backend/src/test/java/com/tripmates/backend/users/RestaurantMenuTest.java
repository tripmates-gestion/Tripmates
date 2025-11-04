package com.tripmates.backend.users;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ActiveProfiles;

import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.config.TestStorageConfig;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.tripmates.backend.common.types.BusinessType;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.BeforeAll;
import com.tripmates.backend.TestHelper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
@Import({ TestCloudinaryConfig.class, TestStorageConfig.class })
public class RestaurantMenuTest {

	@LocalServerPort
	private int port;

	private TestHelper testHelper;

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private MongoTemplate mongoTemplate;

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
	void testGivenRestaurantAccount_WhenAppendMenuItemWithFiles_ThenMenuContainsItemWithPhotos() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("rest@example.com", BusinessType.RESTAURANT);
		String requestJson = """
				{
				  "foodName": "Ceviche",
				  "price": 15.5,
				  "description": "Fresh fish with lime"
				}
				""";

		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				requestJson.getBytes(StandardCharsets.UTF_8));
		MockMultipartFile file1 = new MockMultipartFile("files", "a.jpg", "image/jpeg", new byte[] { 1, 2, 3 });
		MockMultipartFile file2 = new MockMultipartFile("files", "b.png", "image/png", new byte[] { 4, 5 });

		mockMvc
			.perform(multipart("/users/me/restaurant").file(dataPart)
				.file(file1)
				.file(file2)
				.header("Authorization", "Bearer " + jwt))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.role", is("BUSINESS")))
			.andExpect(jsonPath("$.businessType", is("RESTAURANT")))
			.andExpect(jsonPath("$.menu").isArray())
			.andExpect(jsonPath("$.menu[0].foodName", is("Ceviche")))
			.andExpect(jsonPath("$.menu[0].price", is(15.5)))
			.andExpect(jsonPath("$.menu[0].description", is("Fresh fish with lime")))
			.andExpect(jsonPath("$.menu[0].photosURLs").isArray())
			.andExpect(jsonPath("$.menu[0].photosURLs.length()", is(2)))
			.andDo(print());
	}

	@Test
	void testGivenRestaurantAccount_WhenUpdateMenuAllFields_AddAndDeletePhotos_ThenShouldUpdate() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("rest2@example.com", BusinessType.RESTAURANT);
		// Append initial item with 2 photos
		String appendJson = """
				{ "foodName": "Empanada", "price": 5.0, "description": "Beef empanada" }
				""";
		MockMultipartFile appendPart = new MockMultipartFile("data", "", "application/json",
				appendJson.getBytes(StandardCharsets.UTF_8));
		MockMultipartFile p1 = new MockMultipartFile("files", "p1.jpg", "image/jpeg", new byte[] { 1 });
		MockMultipartFile p2 = new MockMultipartFile("files", "p2.jpg", "image/jpeg", new byte[] { 2 });
		mockMvc
			.perform(multipart("/users/me/restaurant").file(appendPart)
				.file(p1)
				.file(p2)
				.header("Authorization", "Bearer " + jwt))
			.andExpect(status().isOk());

		// Update: change name, price, description; add 1 photo; delete photo at index 0
		String updateJson = """
				{ "foodName": "Empanada de Pollo", "price": 6.0, "description": "Chicken empanada", "deletePhotoIndexes": [0] }
				""";
		MockMultipartFile updatePart = new MockMultipartFile("data", "", "application/json",
				updateJson.getBytes(StandardCharsets.UTF_8));
		MockMultipartFile newPhoto = new MockMultipartFile("files", "p3.jpg", "image/jpeg", new byte[] { 3 });

		mockMvc.perform(multipart("/users/me/restaurant/0").file(updatePart).file(newPhoto).with(req -> {
			req.setMethod("PATCH");
			return req;
		}).header("Authorization", "Bearer " + jwt))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.menu[0].foodName", is("Empanada de Pollo")))
			.andExpect(jsonPath("$.menu[0].price", is(6.0)))
			.andExpect(jsonPath("$.menu[0].description", is("Chicken empanada")))
			.andExpect(jsonPath("$.menu[0].photosURLs.length()", is(2)))
			.andDo(print());
	}

	@Test
	void testGivenRestaurantAccount_WhenDeleteMenuItem_ThenMenuEmpty() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("rest3@example.com", BusinessType.RESTAURANT);
		String appendJson = """
				{ "foodName": "Arepa", "price": 4.0, "description": "Corn cake" }
				""";
		MockMultipartFile appendPart = new MockMultipartFile("data", "", "application/json",
				appendJson.getBytes(StandardCharsets.UTF_8));
		mockMvc.perform(multipart("/users/me/restaurant").file(appendPart).header("Authorization", "Bearer " + jwt))
			.andExpect(status().isOk());

		mockMvc.perform(multipart("/users/me/restaurant/0").with(req -> {
			req.setMethod("DELETE");
			return req;
		}).header("Authorization", "Bearer " + jwt))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.menu").isArray())
			.andExpect(jsonPath("$.menu.length()", is(0)))
			.andDo(print());
	}

}
