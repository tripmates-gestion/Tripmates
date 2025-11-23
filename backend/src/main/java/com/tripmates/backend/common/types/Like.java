package com.tripmates.backend.common.types;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Date;

@Data
@AllArgsConstructor
public class Like {

	/**
	 * User's account ID.
	 */
	private String userId;

	/**
	 * Date the publication was liked.
	 */
	private Date createdAt;

}
