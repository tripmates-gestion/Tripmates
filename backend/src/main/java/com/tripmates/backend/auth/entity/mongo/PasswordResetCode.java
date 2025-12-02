package com.tripmates.backend.auth.entity.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "password_reset_codes")
public class PasswordResetCode {

	@Id
	private String id;

	private String email;

	private String code;

	private Date createdAt;

	private boolean used;

	public PasswordResetCode() {
	}

	public PasswordResetCode(String email, String code) {
		this.email = email;
		this.code = code;
		this.createdAt = new Date();
		this.used = false;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	public boolean isUsed() {
		return used;
	}

	public void setUsed(boolean used) {
		this.used = used;
	}

}
