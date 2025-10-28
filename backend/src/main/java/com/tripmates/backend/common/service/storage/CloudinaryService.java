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

    @Override
    public void deleteByUrl(String fileUrl) {
        try {
            String url = fileUrl;
            int q = url.indexOf('?');
            if (q != -1) url = url.substring(0, q);
            String marker = "/upload/";
            int idx = url.indexOf(marker);
            if (idx == -1) {
                return;
            }
            String tail = url.substring(idx + marker.length());
            String[] parts = tail.split("/");
            int start = 0;
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].matches("^v\\d+$")) {
                    start = i + 1;
                    break;
                }
            }
            StringBuilder sb = new StringBuilder();
            for (int i = start; i < parts.length; i++) {
                if (i > start) sb.append('/');
                sb.append(parts[i]);
            }
            String publicId = sb.toString();
            int dot = publicId.lastIndexOf('.');
            if (dot > 0) publicId = publicId.substring(0, dot);
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                "invalidate", true,
                "resource_type", "image"
            ));
        } catch (Exception e) {
            // Swallow deletion errors to avoid blocking business flow
        }
    }
}
