package com.tripmates.backend.users.repository.mongo;

import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.entity.mongo.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserRepositoryCustom {

	/**
	 * Retorna todos los Users que satisfagan con los filtros especificados. En caso de no
	 * especificar filtros, retorna todos los Users.
	 * @param role filtro por rol del usuario.
	 * @param location filtro por la ubicacion del usuario.
	 * @param businessType filtro por el tipo del negocio.
	 * @param pageable cantidad de paginas a retornar
	 * @return {@link org.springframework.data.domain.Pageable Pageable}.
	 */
	Page<User> searchUsers(Role role, String location, BusinessType businessType, Pageable pageable);

}
