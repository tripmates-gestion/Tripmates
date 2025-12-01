package com.tripmates.backend.common.types;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Data
@Getter
@Setter
@AllArgsConstructor
public class Viewed {

	/**
	 * Business's account ID.
	 */
	private String businessId;

	/**
	 * Date the business account was viewed.
	 */
	private Date date;

}
