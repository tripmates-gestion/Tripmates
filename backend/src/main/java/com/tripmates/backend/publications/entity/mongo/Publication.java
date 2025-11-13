package com.tripmates.backend.publications.entity.mongo;

import lombok.Getter;
import lombok.Setter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.tripmates.backend.common.types.AttentionSchedule;
import com.tripmates.backend.common.types.Review;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "publications")
@Getter
@Setter
public class Publication {

	/**
	 * PublicationNode's ID.
	 */
	@Id
	private String id;

	/**
	 * PublicationNode's title.
	 */
	private String title;

	/**
	 * PublicationNode's description.
	 */
	private String description;

	/**
	 * PublicationNode's opening days.
	 */
	private List<DayOfWeek> openingDays = new ArrayList<>();

	/**
	 * PublicationNode's attention schedule.
	 */
	private AttentionSchedule attentionSchedule;

	/**
	 * PublicationNode's exceptional closing days.
	 */
	private List<LocalDate> exceptionalClosingDays = new ArrayList<>();

	/**
	 * PublicationNode's creation date.
	 */
	private Date createdAt = new Date();

	/**
	 * PublicationNode's phone number.
	 */
	private String phoneNumber;

	/**
	 * PublicationNode's email.
	 */
	private String email;

	/**
	 * PublicationNode's location.
	 */
	private String location;

	/**
	 * PublicationNode's images URLs.
	 */
	private List<String> imageUrls = new ArrayList<>();

	/**
	 * PublicationNode's tags.
	 */
	private List<String> tags = new ArrayList<>();

	/**
	 * PublicationNode's reviews.
	 */
	private List<Review> reviews = new ArrayList<>();

	/**
	 * PublicationNode's owner ID.
	 */
	private String ownerId;

	/**
	 * PublicationNode's owner username.
	 */
	private String ownerUsername;

	/**
	 * PublicationNode's owner avatar image URL.
	 */
	private String ownerAvatarUrl;

	public Publication() {
	}

	public Publication(String title, String description, List<DayOfWeek> openingDays,
			AttentionSchedule attentionSchedule, List<LocalDate> exceptionalClosingDays, String phoneNumber,
			String email, String location, List<String> tags, List<String> imageUrls, String ownerId,
			String ownerUsername, String ownerAvatarUrl, Date createdAt) {
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
	}

	/**
	 * Adds a review to the publication.
	 * @param review review made.
	 */
	public void addReview(Review review) {
		this.reviews.add(review);
	}

}
