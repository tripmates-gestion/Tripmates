package com.tripmates.backend.users.repository.mongo;

import com.tripmates.backend.users.dto.AccountSearchRequestDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AccountRepositoryCustom {

	/**
	 * Retorna todos los {@link Account} que satisfagan con los filtros especificados. En
	 * caso de no especificar filtros, retorna todos.
	 * @param accountSearchRequestDTO dto que contiene los filtros por los cuales filtrar.
	 * @param pageable cantidad de paginas a retornar.
	 * @return {@link Pageable Pageable}.
	 */
	Page<Account> searchAccount(AccountSearchRequestDTO accountSearchRequestDTO, Pageable pageable);

}
