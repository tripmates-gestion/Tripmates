package com.tripmates.backend.publications.service;

import com.tripmates.backend.common.exception.UnauthorizedException;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.common.types.Review;
import com.tripmates.backend.publications.dto.*;
import com.tripmates.backend.publications.entity.neo4j.PublicationNode;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;
import com.tripmates.backend.publications.repository.mongo.ReviewRepository;
import com.tripmates.backend.publications.repository.neo4j.PublicationNodeRepository;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.users.dto.account.AccountResumeResponseDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.exception.NotFoundException;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.users.repository.neo4j.AccountNodeRepository;
import com.tripmates.backend.utils.BusinessPublicationBuilder;
import com.tripmates.backend.utils.ReviewBuilder;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.ArrayList;

@Component
@Transactional
@Service
public class PublicationService {

	@Autowired
	private PublicationRepository publicationRepository;

	@Autowired
	private ReviewRepository reviewRepository;

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private PublicationNodeRepository publicationNodeRepository;

	@Autowired
	private AccountNodeRepository accountNodeRepository;

	@Autowired
	private StorageService storageService;

	/**
	 * Creates a new publication for a business.
	 * @param publicationRequestDTO DTO with publication's information.
	 * @param imageFiles publication's images URLs.
	 * @param email business's email.
	 * @return {@link PublicationResumeResponseDTO}.
	 */
	public PublicationResumeResponseDTO createPublication(PublicationRequestDTO publicationRequestDTO,
			List<MultipartFile> imageFiles, String email) {

		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		BusinessPublicationBuilder businessPublicationBuilder = new BusinessPublicationBuilder(storageService)
			.publicationDetails(publicationRequestDTO)
			.owner(account);

		if (imageFiles != null && !imageFiles.isEmpty())
			businessPublicationBuilder = businessPublicationBuilder.imageFiles(imageFiles);

		Publication publication = businessPublicationBuilder.build();

		publicationRepository.save(publication);
		publicationNodeRepository.save(PublicationNode.fromPublication(publication));
		accountNodeRepository.createCreated(account.getId(), publication.getId());

		return PublicationResumeResponseDTO.fromPublication(publication);
	}

	/**
	 * Updates a publication from a business account.
	 * @param publicationId publication's ID.
	 * @param publicationRequestDTO DTO with information to update.
	 * @param multipartFileList publication's images URLs.
	 * @param email business's email.
	 * @return {@link PublicationResumeResponseDTO}.
	 */
	public PublicationResumeResponseDTO updatePublication(String publicationId,
			PublicationUpdateRequestDTO publicationRequestDTO, List<MultipartFile> multipartFileList, String email) {
		Publication publication = publicationRepository.findById(publicationId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.PUBLICATION_NOT_FOUND));

		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (publication.getOwnerId() != null && !publication.getOwnerId().equals(account.getId()))
			throw new UnauthorizedException(ValidationErrorMessage.UNAUTHORIZED);

		if (publicationRequestDTO.title() != null)
			publication.setTitle(publicationRequestDTO.title());

		if (publicationRequestDTO.description() != null)
			publication.setDescription(publicationRequestDTO.description());

		if (publicationRequestDTO.phoneNumber() != null)
			publication.setPhoneNumber(publicationRequestDTO.phoneNumber());

		if (publicationRequestDTO.email() != null)
			publication.setEmail(publicationRequestDTO.email());

		if (publicationRequestDTO.location() != null)
			publication.setLocation(publicationRequestDTO.location());

		if (publicationRequestDTO.openingDays() != null)
			publication.setOpeningDays(publicationRequestDTO.openingDays());

		if (publicationRequestDTO.attentionSchedule() != null)
			publication.setAttentionSchedule(publicationRequestDTO.attentionSchedule());

		if (publicationRequestDTO.exceptionalClosingDays() != null)
			publication.setExceptionalClosingDays(publicationRequestDTO.exceptionalClosingDays());

		publication.setImageUrls(updateImages(publication.getImageUrls(), publicationRequestDTO.deletePhotoIndexes(),
				multipartFileList));

		return PublicationResumeResponseDTO.fromPublication(publicationRepository.save(publication));
	}

	/**
	 * Deletes a publication.
	 * @param publicationId publication's ID.
	 * @param email business's email.
	 */
	public void deletePublication(String publicationId, String email) {
		Publication publication = publicationRepository.findById(publicationId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.PUBLICATION_NOT_FOUND));

		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (publication.getOwnerId() != null && !publication.getOwnerId().equals(account.getId()))
			throw new UnauthorizedException(ValidationErrorMessage.UNAUTHORIZED);

		if (publication.getImageUrls() != null) {
			for (String imageURL : publication.getImageUrls()) {
				if (imageURL != null && !imageURL.isBlank())
					storageService.deleteByUrl(imageURL);
			}
		}

		publicationRepository.deleteById(publicationId);
		publicationNodeRepository.deletePublicationNodeById(publicationId);
	}

	/**
	 * Returns all publications from an authenticated business account.
	 * @param email business's email.
	 * @return {@link PublicationResumeResponseDTO}.
	 */
	public List<PublicationResumeResponseDTO> getPublicationAuthenticated(String email) {
		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		return publicationRepository.findByOwnerId(account.getId())
			.stream()
			.map(PublicationResumeResponseDTO::fromPublication)
			.toList();
	}

	/**
	 * Returns all publications from a business account, by its ID.
	 * @param userId business's ID.
	 * @return {@link PublicationResumeResponseDTO}.
	 */
	public List<PublicationResumeResponseDTO> getPublicationNoneAuthenticated(String userId) {
		accountRepository.findById(userId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		return publicationRepository.findByOwnerId(userId)
			.stream()
			.map(PublicationResumeResponseDTO::fromPublication)
			.toList();
	}

	/**
	 * Returns all publications that match the specified filters.
	 * @param publicationSearchRequestDTO DTO that contains the filters.
	 * @param pageable pages configuration.
	 * @return {@link PublicationResumeResponseDTO}
	 */
	public Page<PublicationResumeResponseDTO> searchPublication(PublicationSearchRequestDTO publicationSearchRequestDTO,
			Pageable pageable) {
		return publicationRepository.search(publicationSearchRequestDTO, pageable)
			.map(PublicationResumeResponseDTO::fromPublication);
	}

	/**
	 * Creates a new review for a publication.
	 * @param reviewCreationRequestDTO DTO with review's information.
	 * @param multipartFileList images URLs from the review.
	 * @param publicationId publication's ID which the review was made.
	 * @param email user's email.
	 * @return {@link ReviewResponseDTO}.
	 */
	public ReviewResponseDTO createReview(ReviewCreationRequestDTO reviewCreationRequestDTO,
			List<MultipartFile> multipartFileList, String publicationId, String email) {
		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (account.getRole() != Role.USER)
			throw new BadRequestException(ValidationErrorMessage.UNAUTHORIZED);

		Publication publication = publicationRepository.findById(publicationId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.REVIEW_PUBLICAITON_ID_NOT_FOUND));

		var reviewConstructor = new ReviewBuilder(storageService).publicationDetails(reviewCreationRequestDTO)
			.publicationId(publicationId)
			.owner(account);

		if (multipartFileList != null && !multipartFileList.isEmpty())
			reviewConstructor = reviewConstructor.imageFiles(multipartFileList);

		Review review = reviewConstructor.build();
		publication.addReview(review);

		publicationRepository.save(publication);
		accountNodeRepository.createReviewed(account.getId(), publication.getId(), review.getReviewId(),
				review.getRating());

		return ReviewResponseDTO.fromEntities(review, publication, account);
	}

	/**
	 * Returns review from a publication ID.
	 * @param publicationId publication's ID.
	 * @return {@link ReviewsListDTO}.
	 */
	public ReviewsListDTO getReviewsFromPublication(String publicationId) {
		Publication publication = publicationRepository.findById(publicationId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.REVIEW_PUBLICAITON_ID_NOT_FOUND));

		List<ReviewResponseDTO> reviews = new ArrayList<>();
		for (Review review : publication.getReviews()) {
			Account account = accountRepository.findById(review.getOwnerId())
				.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

			reviews.add(ReviewResponseDTO.fromEntities(review, publication, account));
		}

		return new ReviewsListDTO(reviews);
	}

	/**
	 * Returns reviews from a user ID.
	 * @param userId user's ID.
	 * @return {@link ReviewsListDTO}.
	 */
	public ReviewsListDTO getReviewsFromUser(String userId) {
		Account owner = accountRepository.findById(userId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		List<ReviewResponseDTO> reviews = new ArrayList<>();

		for (Review review : reviewRepository.findByOwnerId(userId)) {
			Publication publication = publicationRepository.findById(review.getPublicationId())
				.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.REVIEW_PUBLICAITON_ID_NOT_FOUND));

			reviews.add(ReviewResponseDTO.fromEntities(review, publication, owner));
		}
		return new ReviewsListDTO(reviews);
	}

	/**
	 * Uploads images and returns its URLs.
	 * @param multipartFileList images.
	 * @return a list of {@link String} URLs.
	 */
	private List<String> uploadImages(List<MultipartFile> multipartFileList) {
		List<String> urls = new ArrayList<>();
		if (multipartFileList != null) {
			for (MultipartFile multipartFile : multipartFileList) {
				if (multipartFile == null || multipartFile.isEmpty() || multipartFile.getSize() == 0)
					continue;

				urls.add(storageService.uploadFile(multipartFile));
			}
		}

		return urls;
	}

	/**
	 * Updates images.
	 * @param imageURLsList images URLs list.
	 * @param deleteImageIndexList images indexes list to delete.
	 * @param multipartFileList images list to upload and add.
	 * @return list of {@link String} URLs.
	 */
	private List<String> updateImages(List<String> imageURLsList, List<Integer> deleteImageIndexList,
			List<MultipartFile> multipartFileList) {
		if (imageURLsList == null)
			imageURLsList = new ArrayList<>();

		if (deleteImageIndexList != null) {
			for (Integer i : deleteImageIndexList) {
				if (i != null && i >= 0 && i < imageURLsList.size()) {
					storageService.deleteByUrl(imageURLsList.get(i));
					imageURLsList.remove(i.intValue());
				}
			}
		}

		imageURLsList.addAll(uploadImages(multipartFileList));
		return imageURLsList;
	}

	/**
	 * Adds a like to a publication from a user.
	 * @param publicationId publication's ID.
	 * @param email user's email.
	 */
	public void addLike(String publicationId, String email) {
		Publication publication = publicationRepository.findById(publicationId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.PUBLICATION_NOT_FOUND));

		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		checkLikeInteraction(publication, account);

		addLikeInfoOnPublication(publicationId, account.getId());
	}

	/**
	 * Removes a like from a publication.
	 * @param publicationId publication's ID.
	 * @param email user's email.
	 */
	public void removeLike(String publicationId, String email) {
		Publication publication = publicationRepository.findById(publicationId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.PUBLICATION_NOT_FOUND));

		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		checkUnlikeInteraction(publication, account);

		removeLikeInfoOnPublication(publicationId, account.getId());
	}

	/**
	 * Gets the list of users who liked a publication.
	 * @param publicationId publication's ID.
	 * @return {@link LikesListDTO} containing the list of users who liked the
	 * publication.
	 */
	public LikesListDTO getLikesList(String publicationId) {
		Publication publication = publicationRepository.findById(publicationId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.PUBLICATION_NOT_FOUND));

		return new LikesListDTO(formatAccountIdList(publication.getLikes()));
	}

	/**
	 * Checks if the like interaction is valid.
	 * @param publication publication.
	 * @param account user's account.
	 */
	private void checkLikeInteraction(Publication publication, Account account) {
		if (publication.getLikes().contains(account.getId()))
			throw new BadRequestException(ValidationErrorMessage.CANNOT_LIKE_PUBLICATION_TWICE);
	}

	/**
	 * Checks if the unlike interaction is valid.
	 * @param publication publication.
	 * @param account user's account.
	 */
	private void checkUnlikeInteraction(Publication publication, Account account) {
		if (!publication.getLikes().contains(account.getId()))
			throw new BadRequestException(ValidationErrorMessage.CANNOT_UNLIKE_PUBLICATION_NOT_LIKED);
	}

	/**
	 * Adds like info on publication.
	 * @param publicationId publication's ID.
	 * @param userId user's ID.
	 */
	private void addLikeInfoOnPublication(String publicationId, String userId) {
		long isLiked = publicationRepository.existsLike(publicationId, userId);

		if (isLiked > 0)
			throw new BadRequestException(ValidationErrorMessage.CANNOT_LIKE_PUBLICATION_TWICE);

		publicationRepository.addToLikes(publicationId, userId);
		accountNodeRepository.createLiked(userId, publicationId);
	}

	/**
	 * Removes like info from publication.
	 * @param publicationId publication's ID.
	 * @param userId user's ID.
	 */
	private void removeLikeInfoOnPublication(String publicationId, String userId) {
		long isLiked = publicationRepository.existsLike(publicationId, userId);

		if (isLiked == 0)
			throw new BadRequestException(ValidationErrorMessage.CANNOT_UNFOLLOW_SOMEONE_YOU_ARE_NOT_FOLLOWING);

		publicationRepository.removeFromLikes(publicationId, userId);
		// Also remove Neo4j relationship
		accountNodeRepository.removeLiked(userId, publicationId);
	}

	/**
	 * Formats a list of account IDs into AccountResumeResponseDTO.
	 * @param idList list of account IDs.
	 * @return list of {@link AccountResumeResponseDTO}.
	 */
	private List<AccountResumeResponseDTO> formatAccountIdList(List<String> idList) {
		List<AccountResumeResponseDTO> accounts = new ArrayList<>();

		if (idList == null || idList.isEmpty())
			return accounts;

		for (String id : idList) {
			Account account = accountRepository.findById(id).orElse(null);

			if (account != null)
				accounts.add(AccountResumeResponseDTO.fromAccount(account));
		}

		return accounts;
	}

}
