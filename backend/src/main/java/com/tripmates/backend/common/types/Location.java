package com.tripmates.backend.common.types;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Location(@Schema(description = "Location's physical address") @JsonProperty("address") String address,
		@Schema(description = "Location's latitude coordinate") @JsonProperty("latitude") Double latitude,
		@Schema(description = "Location's longitude coordinate") @JsonProperty("longitude") Double longitude) {

	@JsonCreator
	public Location(@JsonProperty("address") String address, @JsonProperty("latitude") Double latitude,
			@JsonProperty("longitude") Double longitude) {
		this.address = address;
		this.latitude = latitude;
		this.longitude = longitude;
	}

}