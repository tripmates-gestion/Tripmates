package com.tripmates.backend.users.repository.mongo;

import com.tripmates.backend.users.entity.mongo.Account;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Representa las queries personalizadas que podemos realizar sobre el documento
 * de
 * {@link com.tripmates.backend.users.entity.mongo.Account User} en MongoDB.
 *
 * @see org.springframework.data.mongodb.repository.MongoRepository
 * @see com.tripmates.backend.users.entity.mongo.Account
 */
public interface AccountRespository extends MongoRepository<Account, String>, UserRepositoryCustom {

	/**
	 * Devuelve el usuario asociado al email.
	 * 
	 * @param email email del usuario.
	 * @return {@link com.tripmates.backend.users.entity.mongo.Account User} o Null.
	 */
	Optional<Account> findByEmail(String email);

}
