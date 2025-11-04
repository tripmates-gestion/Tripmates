package com.tripmates.backend.users.service;

import com.tripmates.backend.common.types.Plan;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;
import com.tripmates.backend.users.dto.*;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRespository;
import com.tripmates.backend.utils.PlanBuilder;
import com.tripmates.backend.utils.updateMe.command.AccountUpdateCommand;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class UserService {

	@Autowired
	private AccountRespository accountRespository;

	@Autowired
	private PublicationRepository publicationRepository;

	@Autowired
	private StorageService storageService;

	/**
	 * Retorna un usuario asociado al email.
	 * @param email email del usuario.
	 * @return {@link Account User}
	 */
	public AccountResumeResponseDTO getUser(String email) {
		Account user = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException("User not found"));

		return AccountResumeResponseDTO.fromAccount(user);
	}

	/**
	 * @param email
	 * @param userUpdateRequestDTO
	 * @param imageFiles
	 * @param avatar
	 * @return
	 */
	public AccountResumeResponseDTO updateUser(String email, UserUpdateRequestDTO userUpdateRequestDTO,
			List<MultipartFile> imageFiles, MultipartFile avatar) {
		List<AccountUpdateCommand> commands = userUpdateRequestDTO.toCommands(storageService);
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		for (AccountUpdateCommand command : commands)
			account = command.apply(account);

		updateAvatar(account, avatar);
		updateProfileImages(account, imageFiles);

		return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
	}

	/**
	 * Retorna una page con los usuarios que cumplen con los filtros especificados.
	 * @param accountSearchRequestDTO dto que contiene los filtros de busqueda.
	 * @param pageable configuración de pages a retornar
	 * @return {@link Page}
	 */
	public Page<AccountResumeResponseDTO> search(AccountSearchRequestDTO accountSearchRequestDTO, Pageable pageable) {
		return accountRespository.searchAccount(accountSearchRequestDTO, pageable)
			.map(AccountResumeResponseDTO::fromAccount);
	}

	/**
	 * @param account
	 * @param avatar
	 */
	private void updateAvatar(Account account, MultipartFile avatar) {
		if (avatar == null || avatar.isEmpty() || avatar.getSize() == 0)
			return;

		String newAvatarUrl = storageService.uploadFile(avatar);
		String oldAvatarUrl = account.getAvatarURL();

		if (oldAvatarUrl != null)
			storageService.deleteByUrl(oldAvatarUrl);

		account.setAvatarURL(newAvatarUrl);
	}

	/**
	 * @param account
	 * @param imageFiles
	 */
	private void updateProfileImages(Account account, List<MultipartFile> imageFiles) {
		if (imageFiles == null || imageFiles.isEmpty())
			return;

		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);

		List<String> oldImageUrls = account.getProfileImageUrls();
		List<String> imageUrls = oldImageUrls != null ? oldImageUrls : new ArrayList<>();
		for (MultipartFile imageFile : imageFiles) {
			String newImageUrl = storageService.uploadFile(imageFile);
			imageUrls.add(newImageUrl);
		}

		account.setProfileImageUrls(imageUrls);
	}

	/**
	 * Crea un nuevo plan de usuario según lo especificado.
	 * @param email email del usuario.
	 * @param planCreationRequestDTO DTO que contiene la información con la cual crear el
	 * plan.
	 */
	public void createPlan(String email, PlanCreationRequestDTO planCreationRequestDTO) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (account.getRole() != Role.USER)
			throw new BadRequestException(ValidationErrorMessage.UNAUTHORIZED);

		PlanBuilder planBuilder = new PlanBuilder().planDetails(planCreationRequestDTO).owner(account);

        if (account.getPlansList() == null)
            account.setPlansList(new ArrayList<>());

        account.getPlansList().add(planBuilder.build());

        accountRespository.save(account);
	}

	/**
	 * Obtains all user's plans.
	 * @param email user's email.
	 * @return a list of {@link PlanResumeResponseDTO}.
	 */
	public List<PlanResumeResponseDTO> getPlans(String email) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (account.getRole() != Role.USER)
			throw new BadRequestException(ValidationErrorMessage.UNAUTHORIZED);

        if (account.getPlansList() == null)
            return new ArrayList<>();

		List<PlanResumeResponseDTO> planResumeResponseDTOList = new ArrayList<>();

		for (Plan plan : account.getPlansList()) {
			List<PublicationResumeResponseDTO> publicationResumeResponseDTOList = new ArrayList<>();

			for (String publicationId : plan.getPublicationsIdList())
				publicationRepository.findById(publicationId)
					.ifPresent(publication -> publicationResumeResponseDTOList
						.add(PublicationResumeResponseDTO.fromPublication(publication)));

			planResumeResponseDTOList.add(PlanResumeResponseDTO.fromPlan(plan, publicationResumeResponseDTOList));
		}

		return planResumeResponseDTOList;
	}

}
