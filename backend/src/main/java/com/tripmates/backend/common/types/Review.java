package com.tripmates.backend.common.types;

import java.util.Date;
import java.util.List;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class Review {

	/**
	 * Review's ID.
	 */
	@Id
	private String reviewId = new ObjectId().toString();

	/**
	 * Publication's ID where the review was made.
	 */
	private String publicationId;

	/**
	 * Review's title.
	 */
	private String title;

	/**
	 * Review's content.
	 */
	private String content;

	/**
	 * Review's rating.
	 */
	private Double rating;

	/**
	 * Review's images.
	 */
	private List<String> imageUrls;

	/**
	 * Owner's ID.
	 */
	private String ownerId;

	/**
	 * Date the review was made.
	 */
	private Date date;

	/**
	 * Mentions of the review.
	 */
	private List<String> mentions;

	public Review(String publicationId, String title, String content, Double rating, List<String> imageUrls,
			String ownerId, List<String> mentions) {
		this.publicationId = publicationId;
		this.title = title;
		this.content = content;
		this.rating = rating;
		this.imageUrls = imageUrls;
		this.ownerId = ownerId;
		this.date = new Date();
		this.mentions = mentions;
	}

}
