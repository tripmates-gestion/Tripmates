package com.tripmates.backend.users.entity.mongo;

import com.tripmates.backend.common.types.AttentionSchedule;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.users.entity.Role;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
@Setter
@Document(collection = "account")
public class Account implements UserDetails {

	/** User's ID. */
	@Id
	private String id;

	/** User's email. */
	@NotNull
	@Indexed(unique = true)
	private String email;

	/** User's username. */
	@NotNull
	private String name;

	/** User's password. */
	@NotNull
	private String password;

	/** User's business type. Only allowed in BUSINESS account. */
	@NotNull
	@Field(targetType = FieldType.STRING)
	private BusinessType businessType;

	/** User's role. */
	@NotNull
	@Field(targetType = FieldType.STRING)
	private Role role;

	/** User's profile description. */
	@Field(targetType = FieldType.STRING)
	private String description;

	/** User's avatar profile URL. */
	@Field(targetType = FieldType.STRING)
	private String avatarURL;

	/** User's refresh token. */
	@Field(targetType = FieldType.STRING)
	private String token;

	/** User's business available days. Only allowed in BUSINESS account. */
	private List<DayOfWeek> openingDays;

	/** User's business attention schedule. Only allowed in BUSINESS account. */
	private AttentionSchedule attentionSchedule;

	/**
	 * User's business particular closing days. Only allowed in BUSINESS account.
	 */
	private List<LocalDate> exceptionalClosingDays;

	/** User's phone number. Only allowed in BUSINESS account. */
	@Field(targetType = FieldType.STRING)
	private String phoneNumber;

	/** User's business location. Only allowed in BUSINESS account. */
	@Field(targetType = FieldType.STRING)
	private String location;

	/** User's profile pictures URLs. */
	private List<String> profileImageUrls;

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
