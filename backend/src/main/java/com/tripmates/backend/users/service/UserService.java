package com.tripmates.backend.users.service;

import com.tripmates.backend.common.types.*;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

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

	public AccountResumeResponseDTO updateMenuItem(String email, int index, MenuItem item, List<MultipartFile> files,
			List<Integer> deletePhotoIndexes) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		if (account.getBusinessType() != BusinessType.RESTAURANT)
			throw new BadRequestException(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT);

		List<MenuItem> current = account.getMenu() != null ? new ArrayList<>(account.getMenu()) : new ArrayList<>();
		if (index < 0 || index >= current.size())
			throw new BadRequestException("Invalid menu index");

		MenuItem currentItem = current.get(index);
		List<String> existing = currentItem.photosURLs();
		List<String> mergedPhotos = existing != null ? new ArrayList<>(existing) : new ArrayList<>();

		List<Integer> idxToDelete = new ArrayList<>();
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

		List<String> urls = new ArrayList<>();
		if (files != null) {
			for (MultipartFile file : files) {
				if (file == null || file.isEmpty() || file.getSize() == 0)
					continue;
				urls.add(storageService.uploadFile(file));
			}
		}
		mergedPhotos.addAll(urls);

		String foodName = (item != null && item.foodName() != null) ? item.foodName() : currentItem.foodName();
		Float price = (item != null && item.price() != null) ? item.price() : currentItem.price();
		String description = (item != null && item.description() != null) ? item.description()
				: currentItem.description();
		current.set(index, new MenuItem(mergedPhotos, foodName, price, description));
		account.setMenu(current);
		return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
	}

	public AccountResumeResponseDTO deleteMenuItem(String email, int index) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		if (account.getBusinessType() != BusinessType.RESTAURANT)
			throw new BadRequestException(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT);

		List<MenuItem> current = account.getMenu() != null ? new ArrayList<>(account.getMenu()) : new ArrayList<>();
		if (index < 0 || index >= current.size())
			throw new BadRequestException("Invalid menu index");
		List<String> photos = current.get(index).photosURLs();
		if (photos != null) {
			for (String url : photos) {
				if (url != null)
					storageService.deleteByUrl(url);
			}
		}
		current.remove(index);
		account.setMenu(current);
		return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
	}

	public AccountResumeResponseDTO updateRoomPack(String email, int index, RoomPack pack, List<MultipartFile> files,
			List<Integer> deletePhotoIndexes) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		if (account.getBusinessType() != BusinessType.HOTEL)
			throw new BadRequestException(ValidationErrorMessage.NOT_HOTEL_ACCOUNT);

		List<RoomPack> current = account.getRoomPacks() != null ? new ArrayList<>(account.getRoomPacks())
				: new ArrayList<>();
		if (index < 0 || index >= current.size())
			throw new BadRequestException("Invalid room pack index");

		RoomPack currentPack = current.get(index);
		List<String> existing = currentPack.photosURLs();
		List<String> mergedPhotos = existing != null ? new ArrayList<>(existing) : new ArrayList<>();

		List<Integer> idxToDelete = new ArrayList<>();
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

		List<String> urls = new ArrayList<>();
		if (files != null) {
			for (MultipartFile file : files) {
				if (file == null || file.isEmpty() || file.getSize() == 0)
					continue;
				urls.add(storageService.uploadFile(file));
			}
		}
		mergedPhotos.addAll(urls);

		java.time.LocalDate checkInDate = (pack != null && pack.checkInDate() != null) ? pack.checkInDate()
				: currentPack.checkInDate();
		java.time.LocalDate checkOutDate = (pack != null && pack.checkOutDate() != null) ? pack.checkOutDate()
				: currentPack.checkOutDate();
		Integer numberOfGuests = (pack != null && pack.numberOfGuests() != null) ? pack.numberOfGuests()
				: currentPack.numberOfGuests();
		java.util.List<String> services = (pack != null && pack.services() != null) ? pack.services()
				: currentPack.services();
		Float priceVal = (pack != null && pack.price() != null) ? pack.price() : currentPack.price();
		String descriptionVal = (pack != null && pack.description() != null) ? pack.description()
				: currentPack.description();
		current.set(index, new RoomPack(checkInDate, checkOutDate, numberOfGuests, services, priceVal, descriptionVal,
				mergedPhotos));
		account.setRoomPacks(current);
		return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
	}

	public AccountResumeResponseDTO deleteRoomPack(String email, int index) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		if (account.getBusinessType() != BusinessType.HOTEL)
			throw new BadRequestException(ValidationErrorMessage.NOT_HOTEL_ACCOUNT);

		List<RoomPack> current = account.getRoomPacks() != null ? new ArrayList<>(account.getRoomPacks())
				: new ArrayList<>();
		if (index < 0 || index >= current.size())
			throw new BadRequestException("Invalid room pack index");
		List<String> photos = current.get(index).photosURLs();
		if (photos != null) {
			for (String url : photos) {
				if (url != null)
					storageService.deleteByUrl(url);
			}
		}
		current.remove(index);
		account.setRoomPacks(current);
		return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
	}

	public AccountResumeResponseDTO addMenuItem(String email, MenuItem item, List<MultipartFile> files) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		if (account.getBusinessType() != BusinessType.RESTAURANT)
			throw new BadRequestException(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT);

		List<String> urls = new ArrayList<>();
		if (files != null) {
			for (MultipartFile file : files) {
				if (file == null || file.isEmpty() || file.getSize() == 0)
					continue;
				urls.add(storageService.uploadFile(file));
			}
		}

		List<String> mergedPhotos = new ArrayList<>();
		if (item.photosURLs() != null)
			mergedPhotos.addAll(item.photosURLs());
		mergedPhotos.addAll(urls);

		MenuItem newItem = new MenuItem(mergedPhotos, item.foodName(), item.price(), item.description());
		List<MenuItem> current = account.getMenu() != null ? account.getMenu() : new ArrayList<>();
		current.add(newItem);
		account.setMenu(current);
		return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
	}

	public AccountResumeResponseDTO addRoomPack(String email, RoomPack pack, List<MultipartFile> files) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		if (account.getBusinessType() != BusinessType.HOTEL)
			throw new BadRequestException(ValidationErrorMessage.NOT_HOTEL_ACCOUNT);

		List<String> urls = new ArrayList<>();
		if (files != null) {
			for (MultipartFile file : files) {
				if (file == null || file.isEmpty() || file.getSize() == 0)
					continue;
				urls.add(storageService.uploadFile(file));
			}
		}

		List<String> mergedPhotos = new ArrayList<>();
		if (pack.photosURLs() != null)
			mergedPhotos.addAll(pack.photosURLs());
		mergedPhotos.addAll(urls);

		RoomPack newPack = new RoomPack(pack.checkInDate(), pack.checkOutDate(), pack.numberOfGuests(), pack.services(),
				pack.price(), pack.description(), mergedPhotos);
		List<RoomPack> current = account.getRoomPacks() != null ? account.getRoomPacks() : new ArrayList<>();
		current.add(newPack);
		account.setRoomPacks(current);
		return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
	}

	public List<String> uploadRestaurantMenuPhotos(String email, List<MultipartFile> files) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		if (account.getBusinessType() != BusinessType.RESTAURANT)
			throw new BadRequestException(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT);

		List<String> urls = new ArrayList<>();
		if (files != null) {
			for (MultipartFile file : files) {
				if (file == null || file.isEmpty() || file.getSize() == 0)
					continue;
				urls.add(storageService.uploadFile(file));
			}
		}
		return urls;
	}

	public List<String> uploadHostingRoomPackPhotos(String email, List<MultipartFile> files) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		if (account.getBusinessType() != BusinessType.HOTEL)
			throw new BadRequestException(ValidationErrorMessage.NOT_HOTEL_ACCOUNT);

		List<String> urls = new ArrayList<>();
		if (files != null) {
			for (MultipartFile file : files) {
				if (file == null || file.isEmpty() || file.getSize() == 0)
					continue;
				urls.add(storageService.uploadFile(file));
			}
		}
		return urls;
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

	public AccountResumeResponseDTO updateRestaurantMenu(String email, List<MenuItem> menu, List<MultipartFile> files) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		if (account.getBusinessType() != BusinessType.RESTAURANT)
			throw new BadRequestException(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT);

		Map<String, String> uploadedByName = new HashMap<>();
		if (files != null) {
			for (MultipartFile file : files) {
				if (file == null || file.isEmpty() || file.getSize() == 0)
					continue;
				String url = storageService.uploadFile(file);
				uploadedByName.put(Objects.requireNonNullElse(file.getOriginalFilename(), url), url);
			}
		}

		Pattern pattern = Pattern.compile("^menu-(\\d+)-(\\d+)\\..+$");
		Map<Integer, Map<Integer, String>> idxPhotos = indexByPosition(uploadedByName, pattern);

		List<MenuItem> newMenu = new ArrayList<>();
		int size = menu != null ? menu.size() : 0;
		for (int i = 0; i < size; i++) {
			MenuItem item = menu.get(i);
			List<String> photos = new ArrayList<>();
			Map<Integer, String> photoIdx = idxPhotos.get(i);
			if (photoIdx != null) {
				photoIdx.keySet().stream().sorted().forEach(j -> photos.add(photoIdx.get(j)));
			}
			else if (item.photosURLs() != null) {
				photos.addAll(item.photosURLs());
			}
			newMenu.add(new MenuItem(photos, item.foodName(), item.price(), item.description()));
		}

		account.setMenu(newMenu);
		return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
	}

	public AccountResumeResponseDTO updateHostingRoomPacks(String email, List<RoomPack> roomPacks,
			List<MultipartFile> files) {
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		if (account.getBusinessType() != BusinessType.HOTEL)
			throw new BadRequestException(ValidationErrorMessage.NOT_HOTEL_ACCOUNT);

		Map<String, String> uploadedByName = new HashMap<>();
		if (files != null) {
			for (MultipartFile file : files) {
				if (file == null || file.isEmpty() || file.getSize() == 0)
					continue;
				String url = storageService.uploadFile(file);
				uploadedByName.put(Objects.requireNonNullElse(file.getOriginalFilename(), url), url);
			}
		}

		Pattern pattern = Pattern.compile("^roompack-(\\d+)-(\\d+)\\..+$");
		Map<Integer, Map<Integer, String>> idxPhotos = indexByPosition(uploadedByName, pattern);

		List<RoomPack> newPacks = new ArrayList<>();
		int size = roomPacks != null ? roomPacks.size() : 0;
		for (int i = 0; i < size; i++) {
			RoomPack rp = roomPacks.get(i);
			List<String> photos = new ArrayList<>();
			Map<Integer, String> photoIdx = idxPhotos.get(i);
			if (photoIdx != null) {
				photoIdx.keySet().stream().sorted().forEach(j -> photos.add(photoIdx.get(j)));
			}
			else if (rp.photosURLs() != null) {
				photos.addAll(rp.photosURLs());
			}
			newPacks.add(new RoomPack(rp.checkInDate(), rp.checkOutDate(), rp.numberOfGuests(), rp.services(),
					rp.price(), rp.description(), photos));
		}

		account.setRoomPacks(newPacks);
		return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
	}

	private static Map<Integer, Map<Integer, String>> indexByPosition(Map<String, String> uploadedByName,
			Pattern pattern) {
		Map<Integer, Map<Integer, String>> result = new HashMap<>();
		for (Map.Entry<String, String> e : uploadedByName.entrySet()) {
			String name = e.getKey() == null ? "" : e.getKey();
			Matcher m = pattern.matcher(name);
			if (m.matches()) {
				int i = Integer.parseInt(m.group(1));
				int j = Integer.parseInt(m.group(2));
				result.computeIfAbsent(i, k -> new HashMap<>()).put(j, e.getValue());
			}
		}
		return result;
	}

}
