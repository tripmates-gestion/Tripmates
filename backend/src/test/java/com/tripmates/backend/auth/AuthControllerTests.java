package com.tripmates.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.json.JSONException;

import com.tripmates.backend.auth.dto.AuthRegisterRequestDTO;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.config.TestSecurityConfig;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.repository.mongo.UserRepository;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.*;
import org.skyscreamer.jsonassert.JSONAssert;

import com.tripmates.backend.TestHelper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Import({ TestCloudinaryConfig.class, TestSecurityConfig.class })
public class AuthControllerTests {

	@LocalServerPort
	private int port;

	private TestHelper testHelper;

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private MongoTemplate mongoTemplate;

	HttpHeaders headers = new HttpHeaders();

	@BeforeAll
	void setUp() {
		testHelper = new TestHelper(port, restTemplate);
	}

	@BeforeEach
	void beforeEach() {
		mongoTemplate.getDb().drop();
	}

	@Test
	void registerUserShouldReturnNoContent() {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("fran", "fran@example.com", "123456",
				Role.USER, null);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<Void> response = restTemplate.postForEntity(testHelper.url("/auth/register"), request,
				Void.class);
		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
		assertEquals(1, userRepository.count());
	}

	@Test
	void testGivenNoName_WhenRegisterUser_ThenShouldFailAndReturnError400() throws JSONException {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO(null, "LETI@example.com", "123456",
				Role.USER, null);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<String> response = restTemplate.postForEntity(testHelper.url("/auth/register"), request,
				String.class);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		String expectedJson = """
				{
				    "type": "about:blank",
				    "title": "Validation Error",
				    "status": 400,
				    "detail": "El campo no debe estar vacio: name",
				    "instance": "/auth/register"
				}
				""";

		JSONAssert.assertEquals(expectedJson, response.getBody(), false);
	}

	@Test
	void testGivenEmptyName_WhenRegisterUser_ThenShouldFailAndReturnError400() throws JSONException {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("", "LETI@example.com", "123456",
				Role.USER, null);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<String> response = restTemplate.postForEntity(testHelper.url("/auth/register"), request,
				String.class);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		String expectedJson = """
				{
				    "type": "about:blank",
				    "title": "Validation Error",
				    "status": 400,
				    "detail": "El campo no debe estar vacio: name",
				    "instance": "/auth/register"
				}
				""";

		JSONAssert.assertEquals(expectedJson, response.getBody(), false);
	}

	@Test
	void testGivenNoEmail_WhenRegisterUser_ThenShouldFailAndReturnError400() throws JSONException {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("leti", null, "123456", Role.USER,
				null);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<String> response = restTemplate.postForEntity(testHelper.url("/auth/register"), request,
				String.class);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		String expectedJson = """
				{
				    "type": "about:blank",
				    "title": "Validation Error",
				    "status": 400,
				    "detail": "El campo no debe estar vacio: email",
				    "instance": "/auth/register"
				}
				""";

		JSONAssert.assertEquals(expectedJson, response.getBody(), false);
	}

	@Test
	void testGivenEmptyEmail_WhenRegisterUser_ThenShouldFailAndReturnError400() throws JSONException {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("leti", "", "123456", Role.USER,
				null);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<String> response = restTemplate.postForEntity(testHelper.url("/auth/register"), request,
				String.class);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		String expectedJson = """
				{
				    "type": "about:blank",
				    "title": "Validation Error",
				    "status": 400,
				    "detail": "El campo no debe estar vacio: email",
				    "instance": "/auth/register"
				}
				""";

		JSONAssert.assertEquals(expectedJson, response.getBody(), false);
	}

	@Test
	void testGivenNoPassword_WhenRegisterUser_ThenShouldFailAndReturnError400() throws JSONException {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("leti", "LETI@example.com", null,
				Role.USER, null);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<String> response = restTemplate.postForEntity(testHelper.url("/auth/register"), request,
				String.class);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		String expectedJson = """
				{
				    "type": "about:blank",
				    "title": "Validation Error",
				    "status": 400,
				    "detail": "El campo no debe estar vacio: password",
				    "instance": "/auth/register"
				}
				""";

		JSONAssert.assertEquals(expectedJson, response.getBody(), false);
	}

	@Test
	void testGivenEmptyPassword_WhenRegisterUser_ThenShouldFailAndReturnError400() throws JSONException {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("leti", "LETI@example.com", "",
				Role.USER, null);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<String> response = restTemplate.postForEntity(testHelper.url("/auth/register"), request,
				String.class);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		String expectedJson = """
				{
				    "type": "about:blank",
				    "title": "Validation Error",
				    "status": 400,
				    "detail": "El campo no debe estar vacio: password",
				    "instance": "/auth/register"
				}
				""";

		JSONAssert.assertEquals(expectedJson, response.getBody(), false);
	}

	@Test
	void testRegisterBusinessShouldReturnNoContent() {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("fran", "fran@example.com", "123456",
				Role.BUSINESS, BusinessType.HOSTING);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<Void> response = restTemplate.postForEntity(testHelper.url("/auth/register"), request,
				Void.class);
		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
		assertEquals(1, userRepository.count());
	}

	@Test
	void testGivenTypeBusiness_whenRegisterUserShouldFailAndReturnError400() throws JSONException {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("fran", "fran@example.com", "123456",
				Role.USER, BusinessType.HOSTING);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<String> response = restTemplate.postForEntity(testHelper.url("/auth/register"), request,
				String.class);
		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		String expectedJson = """
				{
					"type": "about:blank",
					"title": "Validation Error",
					"status": 400,
					"detail": "El campo no está permitido: businessType",
					"instance": "/auth/register"
				}
				""";

		JSONAssert.assertEquals(expectedJson, response.getBody(), false);
	}

	@Test
	void testGivenNoBussinesTypeWhenRegisterBusinessShouldFailAndReturnError400() throws JSONException {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("leti", "leti@example.com", "123456",
				Role.BUSINESS, null);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<String> response = restTemplate.postForEntity(testHelper.url("/auth/register"), request,
				String.class);
		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		String expectedJson = """
				{
					"type": "about:blank",
					"title": "Validation Error",
					"status": 400,
					"detail": "El campo no debe estar vacio: businessType",
					"instance": "/auth/register"
				}
				""";

		JSONAssert.assertEquals(expectedJson, response.getBody(), false);
	}

	@Test
	void testGivenNoName_WhenRegisterBusiness_ThenShouldFailAndReturnError400() throws JSONException {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO(null, "LETI@example.com", "123456",
				Role.BUSINESS, BusinessType.HOSTING);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<String> response = restTemplate.postForEntity(testHelper.url("/auth/register"), request,
				String.class);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		String expectedJson = """
				{
				    "type": "about:blank",
				    "title": "Validation Error",
				    "status": 400,
				    "detail": "El campo no debe estar vacio: name",
				    "instance": "/auth/register"
				}
				""";

		JSONAssert.assertEquals(expectedJson, response.getBody(), false);
	}

}