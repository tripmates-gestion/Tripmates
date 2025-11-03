package com.tripmates.backend.publications.service;

import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.common.types.Review;
import com.tripmates.backend.publications.dto.PublicationRequestDTO;
import com.tripmates.backend.publications.dto.ReviewCreationRequestDTO;
import com.tripmates.backend.publications.dto.PublicationSearchRequestDTO;
import com.tripmates.backend.publications.exception.PublicationNotFoundException;
import com.tripmates.backend.publications.exception.PublicationOwnerException;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;
import com.tripmates.backend.users.repository.mongo.AccountRespository;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.exception.NotFoundException;
import com.tripmates.backend.publications.dto.ReviewResponseDTO;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
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
	private AccountRespository accountRespository;

	@Autowired
	private StorageService storageService;

	/**
	 * Crea una nueva publicación de un negocio. Retorna la publicacion creada.
	 * @param publicationRequestDTO dto que contiene la información de la publicación.
	 * @param imageFiles imagenes de la publicacion.
	 * @param email email del usuario.
	 * @return {@link PublicationResumeResponseDTO}.
	 */
	public PublicationResumeResponseDTO createPublication(PublicationRequestDTO publicationRequestDTO,
			List<MultipartFile> imageFiles, String email) {

		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		BusinessPublicationBuilder businessPublicationBuilder = new BusinessPublicationBuilder(storageService)
			.publicationDetails(publicationRequestDTO)
			.owner(account);

		if (imageFiles != null && !imageFiles.isEmpty())
			businessPublicationBuilder = businessPublicationBuilder.imageFiles(imageFiles);

		return PublicationResumeResponseDTO
			.fromPublication(publicationRepository.save(businessPublicationBuilder.build()));
	}

	public ReviewResponseDTO createReview(ReviewCreationRequestDTO reviewCreationRequestDTO,
			List<MultipartFile> imageFiles, String publicationId, String authenticatedUserEmail

	) {

		Account user = accountRespository.findByEmail(authenticatedUserEmail)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (user.getRole() != Role.USER)
			throw new BadRequestException(ValidationErrorMessage.UNAUTHORIZED);

		Publication publication = publicationRepository.findById(publicationId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.REVIEW_PUBLICAITON_ID_NOT_FOUND));

		var reviewConstructor = new ReviewBuilder(storageService).publicationDetails(reviewCreationRequestDTO)
			.publicationId(publicationId)
			.owner(user);

		if (imageFiles != null && !imageFiles.isEmpty())
			reviewConstructor = reviewConstructor.imageFiles(imageFiles);

		Review review = reviewConstructor.build();
		publication.addReview(review);
		publicationRepository.save(publication);

		return ReviewResponseDTO.fromEntities(review, publication, user);
	}

	/**
	 * Elimina la publicación del usuario autenticado.
	 * @param publicationId ID de la publicación.
	 * @param email email del usuario.
	 */
	public void deletePublication(String publicationId, String email) {
		Publication publication = publicationRepository.findById(publicationId)
			.orElseThrow(() -> new PublicationNotFoundException("Publicacion no encontrada"));

		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (publication.getOwnerId() != null && !publication.getOwnerId().equals(account.getId()))
			throw new PublicationOwnerException("No tenes permiso para eliminar esta publicacion");

		if (publication.getImageUrls() != null) {
			for (String url : publication.getImageUrls()) {
				if (url != null && !url.isBlank())
					storageService.deleteByUrl(url);
			}
		}

		publicationRepository.deleteById(publicationId);
	}

	/**
	 * Retorna todas las publicaciones del usuario autenticado.
	 * @param email email del usuario.
	 * @return {@link PublicationResumeResponseDTO}.
	 */
	public List<PublicationResumeResponseDTO> getPublicationAuthenticated(String email) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		return publicationRepository.findByOwnerId(account.getId())
			.stream()
			.map(PublicationResumeResponseDTO::fromPublication)
			.toList();
	}

	/**
	 * Retorna una lista que contiene todas las publicaciones del usuario.
	 * @param userId ID del usuario.
	 * @return {@link PublicationResumeResponseDTO}.
	 */
	public List<PublicationResumeResponseDTO> getPublicationNoneAuthenticated(String userId) {
		accountRespository.findById(userId)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		return publicationRepository.findByOwnerId(userId)
			.stream()
			.map(PublicationResumeResponseDTO::fromPublication)
			.toList();
	}

	/**
	 * Edita la publicacion del usuario autenticado. Retorna la publicacion actualizada.
	 * @param publicationId ID de la publicacion.
	 * @param publicationRequestDTO dto que contiene la información a actualizar.
	 * @param imageFiles imagenes de la publicacion
	 * @param email email del usuario.
	 * @return {@link PublicationResumeResponseDTO}.
	 */
	public PublicationResumeResponseDTO updatePublication(String publicationId,
			com.tripmates.backend.publications.dto.PublicationUpdateRequestDTO publicationRequestDTO,
			List<MultipartFile> imageFiles, String email) {
		Publication publication = publicationRepository.findById(publicationId)
			.orElseThrow(() -> new PublicationNotFoundException("Publicacion no encontrada"));

		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (publication.getOwnerId() != null && !publication.getOwnerId().equals(account.getId()))
			throw new PublicationOwnerException("No tenes permiso para editar esta publicacion");

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

		List<String> existing = publication.getImageUrls();
		List<String> mergedPhotos = existing != null ? new ArrayList<>(existing) : new ArrayList<>();

		List<Integer> idxToDelete = new ArrayList<>();
		List<Integer> deletePhotoIndexes = publicationRequestDTO.deletePhotoIndexes();
		if (deletePhotoIndexes != null && !deletePhotoIndexes.isEmpty()) {
			for (Integer i : deletePhotoIndexes) {
				if (i != null && i >= 0 && existing != null && i < existing.size())
					idxToDelete.add(i);
			}
		}
		if (!idxToDelete.isEmpty()) {
			List<String> urlsToDelete = new ArrayList<>();
			for (Integer i : idxToDelete) {
				if (existing != null && i >= 0 && i < existing.size())
					urlsToDelete.add(existing.get(i));
			}
			idxToDelete.sort((a, b) -> Integer.compare(b, a));
			for (Integer i : idxToDelete) {
				if (i >= 0 && i < mergedPhotos.size())
					mergedPhotos.remove((int) i);
			}
			for (String url : urlsToDelete) {
				if (url != null)
					storageService.deleteByUrl(url);
			}
		}

		List<String> newUrls = new ArrayList<>();
		if (imageFiles != null) {
			for (MultipartFile file : imageFiles) {
				if (file == null || file.isEmpty() || file.getSize() == 0)
					continue;
				newUrls.add(storageService.uploadFile(file));
			}
		}
		mergedPhotos.addAll(newUrls);
		publication.setImageUrls(mergedPhotos);

		return PublicationResumeResponseDTO.fromPublication(publicationRepository.save(publication));
	}

	/**
	 * Busca una publicacion según filtros. Retorna todas las publicaciones que satisfagan
	 * los filtros.
	 * @param publicationSearchRequestDTO dto que contiene los filtros.
	 * @param pageable configuracion de paginas del search.
	 * @return {@link PublicationResumeResponseDTO}
	 */
	public Page<PublicationResumeResponseDTO> searchPublication(PublicationSearchRequestDTO publicationSearchRequestDTO,
			Pageable pageable) {
		return publicationRepository.search(publicationSearchRequestDTO, pageable)
			.map(PublicationResumeResponseDTO::fromPublication);
	}

}
