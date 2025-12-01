package com.tripmates.backend.seeder;

import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.types.Role;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UserCredentials {

	private String name;

	private String email;

	private String password;

	private Role role;

	private BusinessType businessType;

}
