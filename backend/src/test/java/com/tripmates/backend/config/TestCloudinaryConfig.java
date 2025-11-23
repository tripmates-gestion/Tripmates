package com.tripmates.backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@TestConfiguration
public class TestCloudinaryConfig {

	@Bean
	@Primary
	public Cloudinary cloudinary() {
		return new Cloudinary(ObjectUtils.asMap("cloud_name", "test-cloud", "api_key", "test-key", "api_secret",
				"test-secret", "secure", true));
	}

}
