package com.tripmates.backend.config;

import com.tripmates.backend.common.service.storage.StorageService;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.web.multipart.MultipartFile;

@TestConfiguration
public class TestStorageConfig {

	@Bean
	@Primary
	public StorageService storageService() {
		return new StorageService() {
			private int counter = 0;

			@Override
			public String uploadFile(MultipartFile file) {
				// Return deterministic fake URL per upload
				return String.format("https://test.local/uploaded/%d/%s", ++counter,
						file != null ? file.getOriginalFilename() : "file");
			}

			@Override
			public void deleteByUrl(String fileUrl) {
				// no-op in tests
			}
		};
	}

}
