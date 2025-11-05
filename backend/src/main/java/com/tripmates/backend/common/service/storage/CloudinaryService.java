package com.tripmates.backend.common.service.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tripmates.backend.common.exception.FileUploadException;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CloudinaryService implements StorageService {

	@Autowired
	private Cloudinary cloudinary;

	@SuppressWarnings("rawtypes")
	@Override
	public String uploadFile(MultipartFile file) {
		try {
			Map uploadResult = cloudinary.uploader()
				.upload(file.getBytes(), ObjectUtils.asMap("folder", "tripmates_uploads"));
			return (String) uploadResult.get("secure_url");
		}
		catch (Exception e) {
			throw new FileUploadException(String.format("Error al subir el archivo a la nube: %s", e.getMessage()));
		}
	}

	private String extractPublicId(String imageUrl) {
		String[] parts = imageUrl.split("/upload/");
		if (parts.length < 2) {
			throw new IllegalArgumentException("URL inválida: no contiene '/upload/'");
		}

		String pathPart = parts[1];
		pathPart = pathPart.substring(pathPart.indexOf("/") + 1);
		pathPart = pathPart.replaceAll("\\.[a-zA-Z0-9]+$", "");
		return pathPart;
	}

	@Override
	public void deleteByUrl(String imageUrl) {
		try {
			String publicId = extractPublicId(imageUrl);
			Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
			System.out.println("Delete result: " + result);
		}
		catch (Exception e) {
			throw new FileUploadException(String.format("Error al eliminar el archivo de la nube: %s", e.getMessage()));
		}
	}

}
