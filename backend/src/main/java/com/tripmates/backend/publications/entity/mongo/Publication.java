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
	 * Publication's ID.
	 */
	@Id
	private String id;

	/**
	 * Publication's title.
	 */
	private String title;

	/**
	 * Publication's description.
	 */
	private String description;

	/**
	 * Publication's opening days.
	 */
	private List<DayOfWeek> openingDays = new ArrayList<>();

	/**
	 * Publication's attention schedule.
	 */
	private AttentionSchedule attentionSchedule;

	/**
	 * Publication's exceptional closing days.
	 */
	private List<LocalDate> exceptionalClosingDays = new ArrayList<>();

	/**
	 * Publication's creation date.
	 */
	private Date createdAt = new Date();

	/**
	 * Publication's phone number.
	 */
	private String phoneNumber;

	/**
	 * Publication's email.
	 */
	private String email;

	/**
	 * Publication's location.
	 */
	private String location;

	/**
	 * Publication's images URLs.
	 */
	private List<String> imageUrls = new ArrayList<>();

	/**
	 * Publication's tags.
	 */
	private List<String> tags = new ArrayList<>();

	/**
	 * Publication's reviews.
	 */
	private List<Review> reviews = new ArrayList<>();

	/**
	 * Publication's owner ID.
	 */
	private String ownerId;

	/**
	 * Publication's owner username.
	 */
	private String ownerUsername;

	/**
	 * Publication's owner avatar image URL.
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
