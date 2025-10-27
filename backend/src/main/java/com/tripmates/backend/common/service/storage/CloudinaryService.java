package com.tripmates.backend.common.service.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.tripmates.backend.common.exception.FileUploadException;

import java.util.Map;

@Service
public class CloudinaryService implements StorageService {
    @Autowired
    private Cloudinary cloudinary;

    @SuppressWarnings("rawtypes")
    @Override
    public String uploadFile(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("folder", "tripmates_uploads")
            );
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new FileUploadException(String.format("Error al subir el archivo a la nube: %s", e.getMessage()));
        }
    }
}
