package com.tripmates.backend.publications.entity.mongo;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.tripmates.backend.publications.entity.BusinessPublicationType;
import com.tripmates.backend.publications.entity.AttentionSchedule;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Date;


@Document(collection = "publications")
@Getter
@Setter
public class Publication {
    @Id
    private String id;

    private String title;
    private BusinessPublicationType type; //esto no deberia estar aca
    private String description;
    private List<DayOfWeek> openingDays;
    private AttentionSchedule attentionSchedule;
    private List<LocalDate> exceptionalClosingDays;
    private String phoneNumber;
    private String email;
    private String location;
    private List<String> imageUrls;

    private String ownerId; //Datos embebidos de la cuenta de negocio (para evitar hacer joins)
    private String ownerUsername;
    private String ownerAvatarUrl;

    private Date createdAt = new Date();

    public Publication() {
    }

    public Publication(
        String title,
        BusinessPublicationType type,
        String description,
        List<DayOfWeek> openingDays,
        AttentionSchedule attentionSchedule,
        List<LocalDate> exceptionalClosingDays,
        String phoneNumber,
        String email,
        String location,
        List<String> imageUrls,
        String ownerId, String ownerUsername,
        String ownerAvatarUrl,
        Date createdAt) {
            this.title = title;
            this.type = type;
            this.description = description;
            this.openingDays = openingDays;
            this.attentionSchedule = attentionSchedule;
            this.exceptionalClosingDays = exceptionalClosingDays;
            this.phoneNumber = phoneNumber;
            this.email = email;
            this.location = location;
            this.imageUrls = imageUrls;
            this.ownerId = ownerId;
            this.ownerUsername = ownerUsername;
            this.ownerAvatarUrl = ownerAvatarUrl;
            this.createdAt = createdAt;
    }

    
}
