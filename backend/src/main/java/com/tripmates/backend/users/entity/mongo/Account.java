package com.tripmates.backend.users.entity.mongo;

import com.tripmates.backend.common.types.*;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.types.Plan;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.tripmates.backend.common.types.Location;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

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
	private Location location;

	/** User's phone number. Only allowed in BUSINESS account. */
	@Field(targetType = FieldType.STRING)
	private String phoneNumber;

	/** Account's public email. Only allowed in BUSINESS account. */
	private String publicEmail;

	/** Account's profile pictures URLs. Only allowed in BUSINESS account */
	private List<String> profileImageUrls;

	/**
	 * Account's plans where he is owner. Only allowed in USER account
	 */
	private List<Plan> plansList;

	/**
	 * Account's plans ID where he participates, but it's not an owner. Only allowed in
	 * USER account.
	 */
	private List<String> plansIdList;

	/** Account's business type. Only allowed in BUSINESS account. */
	@NotNull
	@Field(targetType = FieldType.STRING)
	private BusinessType businessType;

	/** Account's average price. Only allowed in BUSINESS account. */
	private AveragePrice averagePrice;

	/**
	 * Account's restaurant type. Only allowed in BUSINESS accounts with business type
	 * equal to Restaurant.
	 */
	private RestaurantType restaurantType;

	/**
	 * Account's restaurant attention schedule. Only allowed in BUSINESS accounts with
	 * business type equal to Restaurant.
	 */
	private AttentionSchedule attentionSchedule;

	/**
	 * Account's restaurant opening days. Only allowed in BUSINESS accounts with business
	 * type equal to Restaurant.
	 */
	private List<DayOfWeek> openingDays;

	/**
	 * Account's restaurant menu. Only allowed in BUSINESS accounts with business type
	 * equal to Restaurant.
	 */
	private List<MenuItem> menu;

	/**
	 * Account's hotel type. Only allowed in BUSINESS accounts with business type equal to
	 * Hotel.
	 */
	private HotelType hotelType;

	/**
	 * Account's hotel room packs. Only allowed in BUSINESS accounts with business type
	 * equal to Hotel.
	 */
	private List<RoomPack> roomPacks;

	/**
	 * Account's following users. Only used in USER account.
	 */
	private List<String> followings = new ArrayList<>();

	/**
	 * Account's followers. Only used in USER account.
	 */
	private List<String> followers = new ArrayList<>();

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

	/**
	 * Gets the account following count.
	 * @return {@link Integer}.
	 */
	public Integer getFollowingCount() {
		return this.followings.size();
	}

	/**
	 * Gets the account followers count.
	 * @return {@link Integer}.
	 */
	public Integer getFollowersCount() {
		return this.followers.size();
	}

}
