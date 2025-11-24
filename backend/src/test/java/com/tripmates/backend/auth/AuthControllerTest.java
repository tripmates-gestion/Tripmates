package com.tripmates.backend.auth;

import com.tripmates.backend.auth.dto.AuthLoginRequestDTO;
import com.tripmates.backend.auth.dto.AuthLoginResponseDTO;
import com.tripmates.backend.auth.dto.AuthLogoutRequestDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.auth.dto.AuthRegisterRequestDTO;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.TestHelper;

import org.json.JSONException;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.*;
import org.skyscreamer.jsonassert.JSONAssert;

import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Import(TestCloudinaryConfig.class)
public class AuthControllerTest {

	@LocalServerPort
	private int port;

	private TestHelper testHelper;

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private MongoTemplate mongoTemplate;

	HttpHeaders headers = new HttpHeaders();

	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeAll
	void setUp() {
		testHelper = new TestHelper(port, restTemplate);
	}

	@BeforeEach
	void beforeEach() {
		mongoTemplate.getDb().drop();
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
	void testGivenTypeBusiness_whenRegisterUserShouldFailAndReturnError400() throws JSONException {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("fran", "fran@example.com", "123456",
				Role.USER, BusinessType.HOTEL);

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
	void testGivenNoBusinessTypeWhenRegisterBusinessShouldFailAndReturnError400() throws JSONException {
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
				Role.BUSINESS, BusinessType.HOTEL);

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
	void testRegisterUserShouldReturnNoContent() {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("Fran Infanti",
				"franInfanti@gmail.com", "123456", Role.USER, null);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<Void> response = restTemplate.postForEntity(testHelper.url("/auth/register"), request,
				Void.class);
		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
	}

	@Test
	void testRegisterBusinessShouldReturnNoContent() {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("Sheraton", "shearton@gmail.com.ar",
				"123456", Role.BUSINESS, BusinessType.HOTEL);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);

		ResponseEntity<Void> response = restTemplate.postForEntity(testHelper.url("/auth/register"), request,
				Void.class);
		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
	}

	@Test
	void testLoginWithAnExistingUserShouldReturnOk() {
		Account kansas = new Account();
		kansas.setEmail("kansas@gmail.com.ar");
		kansas.setName("Kansas");
		kansas.setPassword(passwordEncoder.encode("123456789"));
		kansas.setBusinessType(BusinessType.RESTAURANT);
		kansas.setRole(Role.BUSINESS);
		accountRepository.save(kansas);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthLoginRequestDTO> request = new HttpEntity<>(
				new AuthLoginRequestDTO("kansas@gmail.com.ar", "123456789"), headers);

		ResponseEntity<AuthLoginResponseDTO> response = restTemplate.postForEntity(testHelper.url("/auth/login"),
				request, AuthLoginResponseDTO.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertNotNull(Objects.requireNonNull(accountRepository.findByEmail(kansas.getEmail()).orElse(null)).getToken());
	}

	@Test
	void testLogoutWithAnExistingUserShouldReturnNoContent() {
		Account kansas = new Account();
		kansas.setEmail("kansas@gmail.com.ar");
		kansas.setName("Kansas");
		kansas.setPassword(passwordEncoder.encode("123456789"));
		kansas.setBusinessType(BusinessType.RESTAURANT);
		kansas.setRole(Role.BUSINESS);
		accountRepository.save(kansas);

		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthLoginRequestDTO> login = new HttpEntity<>(
				new AuthLoginRequestDTO("kansas@gmail.com.ar", "123456789"), headers);

		ResponseEntity<AuthLoginResponseDTO> loginResponse = restTemplate.postForEntity(testHelper.url("/auth/login"),
				login, AuthLoginResponseDTO.class);

		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.setBearerAuth(loginResponse.getBody().accessToken());

		HttpEntity<AuthLogoutRequestDTO> logout = new HttpEntity<>(new AuthLogoutRequestDTO("kansas@gmail.com.ar"),
				headers);

		ResponseEntity<Void> logoutResponse = restTemplate.postForEntity(testHelper.url("/auth/logout"), logout,
				Void.class);

		assertEquals(HttpStatus.NO_CONTENT, logoutResponse.getStatusCode());
	}

}