package com.tripmates.backend.publications.entity.mongo;

import com.tripmates.backend.common.types.AttentionSchedule;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;<<<<<<<HEAD=======
import com.tripmates.backend.common.types.AttentionSchedule;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;>>>>>>>origin/dev-front

@Document(collection="publications")

@Getter
@Setter
public class Publication {

	<<<<<<<HEAD
	@Id
	private String id;

	private String title;

	private String description;

	private List<DayOfWeek> openingDays;

	=======
	private String title;

	private String description;

	private List<DayOfWeek> openingDays = new ArrayList<>();

	private AttentionSchedule attentionSchedule;

	private List<LocalDate> exceptionalClosingDays = new ArrayList<>();

	private String phoneNumber;

	private String email;

	private String location;

	private List<String> imageUrls = new ArrayList<>();

	private List<String> tags = new ArrayList<>();

	private String ownerId; // Datos embebidos de la cuenta de negocio (para evitar hacer
							// joins)

	private String ownerUsername;

	private String ownerAvatarUrl;

	private Date createdAt = new Date();

	>>>>>>>origin/dev-front

	private AttentionSchedule attentionSchedule;

	<<<<<<<HEAD
	private List<LocalDate> exceptionalClosingDays;

	private String phoneNumber;

	private String email;

	private String location;

	private List<String> imageUrls;

	private String ownerId; // Datos embebidos de la cuenta de negocio (para evitar hacer
							// joins)

	private String ownerUsername;

	private String ownerAvatarUrl;

	private Date createdAt = new Date();

	public Publication() {
	}

	public Publication(String title, String description, List<DayOfWeek> openingDays,
			AttentionSchedule attentionSchedule, List<LocalDate> exceptionalClosingDays, String phoneNumber,
			String email, String location, List<String> imageUrls, String ownerId, String ownerUsername,
			String ownerAvatarUrl, Date createdAt) {
		this.title = title;
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
	}=======

	public Publication(
            String title,
            String description,
            List<DayOfWeek> openingDays,
            AttentionSchedule attentionSchedule,
            List<LocalDate> exceptionalClosingDays,
            String phoneNumber,
            String email,
            String location,
            List<String> tags,
            List<String> imageUrls,
            String ownerId, String ownerUsername,
            String ownerAvatarUrl,
            Date createdAt) {
        this.title = title;
        this.description = description;
        this.openingDays.addAll(openingDays);
        this.attentionSchedule = attentionSchedule;
        this.exceptionalClosingDays.addAll(exceptionalClosingDays);
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.location = location;
        this.tags.addAll(tags);
        this.imageUrls.addAll(imageUrls);
        this.ownerId = ownerId;
        this.ownerUsername = ownerUsername;
        this.ownerAvatarUrl = ownerAvatarUrl;
        this.createdAt = createdAt;
    }>>>>>>>origin/dev-front

}
