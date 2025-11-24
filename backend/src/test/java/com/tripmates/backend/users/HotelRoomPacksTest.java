package com.tripmates.backend.users;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.BeforeAll;

import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.config.TestStorageConfig;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.TestHelper;

import java.nio.charset.StandardCharsets;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
@Import({ TestCloudinaryConfig.class, TestStorageConfig.class })
public class HotelRoomPacksTest {

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
	void testGivenHotelAccount_WhenAppendRoomPackWithFiles_ThenRoomPackPresentWithPhotos() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("hotel@example.com", BusinessType.HOTEL);
		String requestJson = """
				{
				  "checkInDate": "2025-01-01",
				  "checkOutDate": "2025-01-05",
				  "numberOfGuests": 2,
				  "services": ["wifi","breakfast"],
				  "price": 120.0,
				  "description": "Double room"
				}
				""";

		MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
				requestJson.getBytes(StandardCharsets.UTF_8));
		MockMultipartFile file1 = new MockMultipartFile("files", "r1.jpg", "image/jpeg", new byte[] { 1, 2 });
		MockMultipartFile file2 = new MockMultipartFile("files", "r2.png", "image/png", new byte[] { 3 });

		mockMvc
			.perform(multipart("/users/me/hosting").file(dataPart)
				.file(file1)
				.file(file2)
				.header("Authorization", "Bearer " + jwt))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.role", is("BUSINESS")))
			.andExpect(jsonPath("$.businessType", is("HOTEL")))
			.andExpect(jsonPath("$.roomPacks").isArray())
			.andExpect(jsonPath("$.roomPacks[0].checkInDate", is("2025-01-01")))
			.andExpect(jsonPath("$.roomPacks[0].checkOutDate", is("2025-01-05")))
			.andExpect(jsonPath("$.roomPacks[0].numberOfGuests", is(2)))
			.andExpect(jsonPath("$.roomPacks[0].services").isArray())
			.andExpect(jsonPath("$.roomPacks[0].services.length()", is(2)))
			.andExpect(jsonPath("$.roomPacks[0].price", is(120.0)))
			.andExpect(jsonPath("$.roomPacks[0].description", is("Double room")))
			.andExpect(jsonPath("$.roomPacks[0].photosURLs").isArray())
			.andExpect(jsonPath("$.roomPacks[0].photosURLs.length()", is(2)))
			.andDo(print());
	}

	@Test
	void testGivenHotelAccount_WhenUpdateAllFields_AddAndDeletePhotos_ThenShouldUpdate() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("hotel2@example.com", BusinessType.HOTEL);
		// Append initial pack with 2 photos
		String appendJson = """
				{ "checkInDate": "2025-02-01", "checkOutDate": "2025-02-03", "numberOfGuests": 1, "services": ["wifi"], "price": 90.0, "description": "Single" }
				""";
		MockMultipartFile appendPart = new MockMultipartFile("data", "", "application/json",
				appendJson.getBytes(StandardCharsets.UTF_8));
		MockMultipartFile p1 = new MockMultipartFile("files", "p1.jpg", "image/jpeg", new byte[] { 1 });
		MockMultipartFile p2 = new MockMultipartFile("files", "p2.jpg", "image/jpeg", new byte[] { 2 });
		mockMvc
			.perform(multipart("/users/me/hosting").file(appendPart)
				.file(p1)
				.file(p2)
				.header("Authorization", "Bearer " + jwt))
			.andExpect(status().isOk());

		// Update: change dates, guests, services, price, desc; add new photo; delete
		// photo index 0
		String updateJson = """
				{ "checkInDate": "2025-02-02", "checkOutDate": "2025-02-04", "numberOfGuests": 2, "services": ["wifi","pool"], "price": 95.0, "description": "Single updated", "deletePhotoIndexes": [0] }
				""";
		MockMultipartFile updatePart = new MockMultipartFile("data", "", "application/json",
				updateJson.getBytes(StandardCharsets.UTF_8));
		MockMultipartFile newPhoto = new MockMultipartFile("files", "p3.jpg", "image/jpeg", new byte[] { 3 });

		mockMvc.perform(multipart("/users/me/hosting/0").file(updatePart).file(newPhoto).with(req -> {
			req.setMethod("PATCH");
			return req;
		}).header("Authorization", "Bearer " + jwt))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.roomPacks[0].checkInDate", is("2025-02-02")))
			.andExpect(jsonPath("$.roomPacks[0].checkOutDate", is("2025-02-04")))
			.andExpect(jsonPath("$.roomPacks[0].numberOfGuests", is(2)))
			.andExpect(jsonPath("$.roomPacks[0].services.length()", is(2)))
			.andExpect(jsonPath("$.roomPacks[0].price", is(95.0)))
			.andExpect(jsonPath("$.roomPacks[0].description", is("Single updated")))
			.andExpect(jsonPath("$.roomPacks[0].photosURLs.length()", is(2)))
			.andDo(print());
	}

	@Test
	void testGivenHotelAccount_WhenDeleteRoomPack_ThenRoomPacksEmpty() throws Exception {
		String jwt = testHelper.getBusinessTestingJwt("hotel3@example.com", BusinessType.HOTEL);
		String appendJson = """
				{ "checkInDate": "2025-03-10", "checkOutDate": "2025-03-12", "numberOfGuests": 3, "services": ["pool"], "price": 150.0, "description": "Triple" }
				""";
		MockMultipartFile appendPart = new MockMultipartFile("data", "", "application/json",
				appendJson.getBytes(StandardCharsets.UTF_8));
		mockMvc.perform(multipart("/users/me/hosting").file(appendPart).header("Authorization", "Bearer " + jwt))
			.andExpect(status().isOk());

		mockMvc.perform(multipart("/users/me/hosting/0").with(req -> {
			req.setMethod("DELETE");
			return req;
		}).header("Authorization", "Bearer " + jwt))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.roomPacks").isArray())
			.andExpect(jsonPath("$.roomPacks.length()", is(0)))
			.andDo(print());
	}

}
