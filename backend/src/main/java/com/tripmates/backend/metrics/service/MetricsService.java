package com.tripmates.backend.metrics.service;

import com.tripmates.backend.common.exception.NotFoundException;
import com.tripmates.backend.common.exception.UnauthorizedException;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.types.EventReport;
import com.tripmates.backend.common.types.Review;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.metrics.entity.mongo.ProfileView;
import com.tripmates.backend.metrics.repository.ProfileViewsRepository;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;

import java.util.Date;
import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Component
@Transactional
@Service
public class MetricsService {

	@Autowired
	private ProfileViewsRepository profileViewsRepository;

	@Autowired
	private PublicationRepository publicationRepository;

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

	private Account validateBusinessAccount(String email) {
		Account account = validateExistentAccount(email);
		if (account.getRole() != Role.BUSINESS) {
			throw new UnauthorizedException(ValidationErrorMessage.USER_ACCOUNT_CANT_REQUEST_STATISTICS);
		}
		return account;
	}

	public EventReport getReviewsEventReport(String email, Integer daysAgo) {
		Account account = validateBusinessAccount(email);
		Date requestTime = new Date();
		Date startTime = calculateStartTime(daysAgo, requestTime);
		List<Date> reviews = publicationRepository.findReviewDatesByBusinessIdAndDateRange(account.getId(), startTime,
				requestTime);
		return new EventReport(reviews.size(), reviews);
	}

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

	public Integer getAllLikes(String email) {
		Account account = validateBusinessAccount(email);
		return publicationRepository.countLikesFromAccountId(account.getId());
	}
  
  public List<PublicationResumeResponseDTO> getMostLikedsPublications(Integer n) {
    return publicationRepository.findNMostLikedsPublications(n).stream().map(PublicationResumeResponseDTO::fromPublication).toList();
  }

	/**
	 * Obtiene el promedio de calificaciones de todas las reseñas que tengan una calificación asignada.
	 * @param email Email del negocio autenticado
	 * @return Promedio de calificaciones (número entre 1.0 y 5.0) o null si no hay reseñas con calificación
	 */
	public Double getReviewRatingsAvg(String email) {
		Account account = validateBusinessAccount(email);
		
		List<Publication> publications = publicationRepository.findByOwnerId(account.getId());
		
		DoubleSummaryStatistics stats = publications.stream()
			.flatMap(pub -> pub.getReviews().stream())
			.filter(review -> review.getRating() != null && review.getRating() >= 0)
			.mapToDouble(Review::getRating)
			.summaryStatistics();
		
		return stats.getCount() > 0 ? stats.getAverage() : null;
}
}
