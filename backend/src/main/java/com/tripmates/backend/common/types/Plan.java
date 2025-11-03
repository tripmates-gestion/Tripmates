package com.tripmates.backend.common.types;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

@Data
@Setter
@Getter
public class Plan {

	/**
	 * Plan's ID.
	 */
	@Id
	private String id = new ObjectId().toString();

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

    /**
     * Retorna un plan según lo especificado.
     *
     * @param ownerId ID del usuario dueño del plan.
     * @param name nombre del plan
     * @param description descripción del plan.
     */
    public Plan(String ownerId, @NotNull String name, String description) {
        this.ownerId = ownerId;
        this.name = name;
        this.description = description;
    }
}
