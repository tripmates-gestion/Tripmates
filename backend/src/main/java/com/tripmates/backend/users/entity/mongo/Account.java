package com.tripmates.backend.users.entity.mongo;

import com.tripmates.backend.common.types.AttentionSchedule;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.types.MenuItem;
import com.tripmates.backend.common.types.RoomPack;
import com.tripmates.backend.users.entity.Role;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.util.Collection;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.tripmates.backend.common.types.AveragePrice;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Document(collection = "account")
public class Account implements UserDetails {

	/** Account's refresh token. */
	@Field(targetType = FieldType.STRING)
	private String token;

	/** Account's ID. */
	@Id
	private String id;

	/** Account's avatar profile URL. */
	@Field(targetType = FieldType.STRING)
	private String avatarURL;

	/** Account's name. */
	@NotNull
	private String name;

	/** Account's email. */
	@NotNull
	@Indexed(unique = true)
	private String email;

	/** Account's password. */
	@NotNull
	private String password;

	/** Account's role. */
	@NotNull
	@Field(targetType = FieldType.STRING)
	private Role role;

	/** Account's profile description. */
	@Field(targetType = FieldType.STRING)
	private String description;

	/** Account's business location. Only allowed in BUSINESS account. */
	@Field(targetType = FieldType.STRING)
	private String location;

	/** User's phone number. Only allowed in BUSINESS account. */
	@Field(targetType = FieldType.STRING)
	private String phoneNumber;

	/** Account's public email. Only allowed in BUSINESS account. */
	private String publicEmail;

	/** Account's profile pictures URLs. Only allowed in BUSINESS account */
	private List<String> profileImageUrls;

	/** Account's business type. Only allowed in BUSINESS account. */
	@NotNull
	@Field(targetType = FieldType.STRING)
	private BusinessType businessType;

	/** Account's average price. Only allowed in BUSINESS account. */
	private AveragePrice averagePrice;

	/**
	 * For restaurants:
	 */
	private String restaurantType;

	private AttentionSchedule attentionSchedule;

	private List<DayOfWeek> openingDays;

	private List<MenuItem> menu;

	/*
	 * For hotels:
	 */
	private String hotelType;

	private List<RoomPack> roomPacks;

	@Override
	public String getPassword() {
		return this.password;
	}

	@Override
	public String getUsername() {
		return this.email;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_" + this.role.name()));
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}

}
