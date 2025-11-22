package com.tripmates.backend.metrics.entity.mongo;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import com.tripmates.backend.common.types.Role;

@Getter
@Setter
@Document(collection = "profile_view")
public class ProfileView {

	@Id
	private String id;

	private String viewerEmail;

	private Role viewerRole;

	private Date date = new Date();

	@Indexed()
	private String profileSeenEmail;

	public ProfileView() {
	}

	public ProfileView(String viewerEmail, String profileSeenEmail, Role viewerRole) {
		this.viewerEmail = viewerEmail;
		this.date = new Date();
		this.profileSeenEmail = profileSeenEmail;
		this.viewerRole = viewerRole;

	}

}
