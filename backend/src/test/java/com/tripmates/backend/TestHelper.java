package com.tripmates.backend;

import org.springframework.test.context.ActiveProfiles;
import org.apache.hc.core5.http.HttpStatus;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.Map;

import com.tripmates.backend.auth.dto.AuthLoginRequestDTO;
import com.tripmates.backend.auth.dto.AuthRegisterRequestDTO;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.types.Role;

@ActiveProfiles("test")
public class TestHelper {

	private final int port;

	private final TestRestTemplate restTemplate;

	public TestHelper(int port, TestRestTemplate restTemplate) {
		this.port = port;
		this.restTemplate = restTemplate;
	}

	public String url(String path) {
		return "http://localhost:" + port + path;
	}

	public boolean regist(String email, Role role, BusinessType businessType) {
		AuthRegisterRequestDTO authRegisterRequestDTO = new AuthRegisterRequestDTO("myName", email, "contraseña", role,
				businessType);
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthRegisterRequestDTO> request = new HttpEntity<>(authRegisterRequestDTO, headers);
		var response = restTemplate.postForEntity(url("/auth/register"), request, Void.class);
		return response.getStatusCode().value() == HttpStatus.SC_NO_CONTENT;
	}

	public String getUserTestingJwt(String email) {
		if (!regist(email, Role.USER, null))
			return null;
		return getTestingJwt(email, "contraseña");
	}

	public String getBusinessTestingJwt(String email, BusinessType businessType) {
		if (!regist(email, Role.BUSINESS, businessType))
			return null;
		return getTestingJwt(email, "contraseña");
	}

	private String getTestingJwt(String email, String password) {
		AuthLoginRequestDTO authLoginRequestDTO = new AuthLoginRequestDTO(email, password);
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<AuthLoginRequestDTO> request = new HttpEntity<>(authLoginRequestDTO, headers);
		ResponseEntity<Map<String, String>> responseEntity = restTemplate.exchange(url("/auth/login"), HttpMethod.POST,
				request, new ParameterizedTypeReference<Map<String, String>>() {
				});
		Map<String, String> response = responseEntity.getBody();
		return response.get("accessToken");
	}

}