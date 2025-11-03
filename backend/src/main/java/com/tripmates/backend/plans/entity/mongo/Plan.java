package com.tripmates.backend.plans.entity.mongo;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Document(collection = "plan")
public class Plan {

	/**
	 * Plan's ID.
	 */
	@Id
	private String id;

	/**
	 * Plan's name.
	 */
	@NotNull
	@Field(targetType = FieldType.STRING)
	private String name;

	/**
	 * Plan's description.
	 */
	@Field(targetType = FieldType.STRING)
	private String description;

	/**
	 * Plan's owner account ID.
	 */
	@NotNull
	@Field(targetType = FieldType.STRING)
	private String ownerId;

}
