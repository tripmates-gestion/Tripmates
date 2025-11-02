package com.tripmates.backend.publications.service;

import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.publications.dto.BusinessPublicationRequestDTO;

import com.tripmates.backend.publications.dto.PublicationSearchRequestDTO;
import com.tripmates.backend.publications.exception.PublicationNotFoundException;
import com.tripmates.backend.publications.exception.PublicationOwnerException;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;
import com.tripmates.backend.users.repository.mongo.AccountRespository;
import com.tripmates.backend.utils.PublicationBuilder;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
import com.tripmates.backend.publications.entity.mongo.Publication;

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
	 * @param businessPublicationRequestDTO dto que contiene la información de la
	 * publicación.
	 * @param imageFiles imagenes de la publicacion.
	 * @param email email del usuario.
	 * @return {@link PublicationResumeResponseDTO}.
	 */
	public PublicationResumeResponseDTO create(BusinessPublicationRequestDTO businessPublicationRequestDTO,
			List<MultipartFile> imageFiles, String email) {

		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

		PublicationBuilder publicationBuilder = new PublicationBuilder(storageService)
			.publicationDetails(businessPublicationRequestDTO)
			.owner(account);

		if (imageFiles != null && !imageFiles.isEmpty())
			publicationBuilder = publicationBuilder.imageFiles(imageFiles);

		return PublicationResumeResponseDTO.fromPublication(publicationRepository.save(publicationBuilder.build()));
	}

	/**
	 * Elimina la publicación del usuario autenticado.
	 * @param publicationId ID de la publicación.
	 * @param email email del usuario.
	 */
	public void delete(String publicationId, String email) {
		Publication publication = publicationRepository.findById(publicationId)
			.orElseThrow(() -> new PublicationNotFoundException("Publicacion no encontrada"));

		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException("User not found"));

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
	public List<PublicationResumeResponseDTO> getAuthenticated(String email) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

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
	public List<PublicationResumeResponseDTO> getNoneAuthenticated(String userId) {
		accountRespository.findById(userId).orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

		return publicationRepository.findByOwnerId(userId)
			.stream()
			.map(PublicationResumeResponseDTO::fromPublication)
			.toList();
	}

	/**
	 * Edita la publicacion del usuario autenticado. Retorna la publicacion actualizada.
	 * @param publicationId ID de la publicacion.
	 * @param businessPublicationRequestDTO dto que contiene la información a actualizar.
	 * @param imageFiles imagenes de la publicacion
	 * @param email email del usuario.
	 * @return {@link PublicationResumeResponseDTO}.
	 */
	public PublicationResumeResponseDTO update(String publicationId,
			BusinessPublicationRequestDTO businessPublicationRequestDTO, List<MultipartFile> imageFiles, String email) {
		Publication publication = publicationRepository.findById(publicationId)
			.orElseThrow(() -> new PublicationNotFoundException("Publicacion no encontrada"));

		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException("User not found"));

		if (publication.getOwnerId() != null && !publication.getOwnerId().equals(account.getId()))
			throw new PublicationOwnerException("No tenes permiso para editar esta publicacion");

		if (businessPublicationRequestDTO.title() != null)
			publication.setTitle(businessPublicationRequestDTO.title());

		if (businessPublicationRequestDTO.description() != null)
			publication.setDescription(businessPublicationRequestDTO.description());

		if (businessPublicationRequestDTO.phoneNumber() != null)
			publication.setPhoneNumber(businessPublicationRequestDTO.phoneNumber());

		if (businessPublicationRequestDTO.email() != null)
			publication.setEmail(businessPublicationRequestDTO.email());

		if (businessPublicationRequestDTO.location() != null)
			publication.setLocation(businessPublicationRequestDTO.location());

		if (businessPublicationRequestDTO.openingDays() != null)
			publication.setOpeningDays(businessPublicationRequestDTO.openingDays());

		if (businessPublicationRequestDTO.attentionSchedule() != null)
			publication.setAttentionSchedule(businessPublicationRequestDTO.attentionSchedule());

		if (businessPublicationRequestDTO.exceptionalClosingDays() != null)
			publication.setExceptionalClosingDays(businessPublicationRequestDTO.exceptionalClosingDays());

		if (imageFiles != null && !imageFiles.isEmpty()) {
			if (publication.getImageUrls() != null) {
				for (String oldUrl : publication.getImageUrls()) {
					if (oldUrl != null && !oldUrl.isBlank())
						storageService.deleteByUrl(oldUrl);
				}
			}

			ArrayList<String> urls = new ArrayList<>();
			for (MultipartFile file : imageFiles) {
				String url = storageService.uploadFile(file);
				urls.add(url);
			}

			publication.setImageUrls(urls);
		}

		return PublicationResumeResponseDTO.fromPublication(publicationRepository.save(publication));
	}

	/**
	 * Busca una publicacion según filtros. Retorna todas las publicaciones que satisfagan
	 * los filtros.
	 * @param publicationSearchRequestDTO dto que contiene los filtros.
	 * @param pageable configuracion de paginas del search.
	 * @return {@link PublicationResumeResponseDTO}
	 */
	public Page<PublicationResumeResponseDTO> search(PublicationSearchRequestDTO publicationSearchRequestDTO,
			Pageable pageable) {
		return publicationRepository.search(publicationSearchRequestDTO, pageable)
			.map(PublicationResumeResponseDTO::fromPublication);
	}

}
