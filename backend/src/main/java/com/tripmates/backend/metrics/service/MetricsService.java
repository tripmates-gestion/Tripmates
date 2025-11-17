package com.tripmates.backend.metrics.service;

import com.tripmates.backend.common.exception.NotFoundException;
import com.tripmates.backend.common.exception.UnauthorizedException;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.types.EventReport;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripmates.backend.metrics.entity.mongo.ProfileView;
import com.tripmates.backend.metrics.repository.ProfileViewsRepository;
import com.tripmates.backend.publications.repository.mongo.ReviewRepository;
import java.util.List;
import java.util.Optional;

@Component
@Transactional
@Service
public class MetricsService {

	@Autowired
	private ProfileViewsRepository profileViewsRepository;

	@Autowired
	private ReviewRepository reviewRepository;

	@Autowired
	private AccountRepository accountRepository;

	public EventReport getProfileViewsEventReport(String email, Integer daysAgo) {
		validateBusinessAccount(email);
		Date requestTime = new Date();
		Date startTime = calculateStartTime(daysAgo, requestTime);
		List<Date> profileViews = profileViewsRepository
			.findByProfileSeenEmailAndDateBetween(email, startTime, requestTime)
			.stream()
			.map(ProfileView::getDate)
			.toList();
		return new EventReport(profileViews.size(), profileViews);
	}

	public void registerProfileView(String viewerEmail, String profileSeenEmail) {
		Account viewerAccount = validateExistentAccount(viewerEmail);
		validateExistentAccount(profileSeenEmail);
		if (viewerEmail.equals(profileSeenEmail)) {
			return;
		}

		ProfileView profileViews = new ProfileView(viewerEmail, profileSeenEmail, viewerAccount.getRole());
		profileViewsRepository.save(profileViews);
	}

	private void validateBusinessAccount(String email) {
		Account account = validateExistentAccount(email);
		if (account.getRole() != Role.BUSINESS) {
			throw new UnauthorizedException(ValidationErrorMessage.USER_ACCOUNT_CANT_REQUEST_STATISTICS);
		}
	}

	// public EventReport getReviewsEventReport(String email, Integer daysAgo) {
	// //Debo buscar en las publicaciones: cuales son las mías, hago un unwind de las
	// reviews y me quedo con las que están en el periodo de tiempo
	// validateBusinessAccount(email);
	// Date requestTime = new Date();
	// Date startTime = calculateStartTime(daysAgo, requestTime);

	// return new EventReport(reviews.size(), reviews);
	// }

	private Date calculateStartTime(Integer daysAgo, Date requestTime) {
		Date startTime = new Date(requestTime.getTime() - daysAgo * 24 * 60 * 60 * 1000);
		return startTime;
	}

	private Account validateExistentAccount(String email) {
		Optional<Account> account = accountRepository.findByEmail(email);
		if (!account.isPresent()) {
			throw new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND);
		}
		return account.get();
	}

}
