package com.tripmates.backend.users.service;

import com.tripmates.backend.common.exception.NotFoundException;
import com.tripmates.backend.common.types.*;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
import com.tripmates.backend.publications.entity.neo4j.PublicationNode;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;
import com.tripmates.backend.publications.repository.neo4j.PublicationNodeRepository;
import com.tripmates.backend.users.dto.*;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.entity.neo4j.AccountNode;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.users.repository.neo4j.AccountNodeRepository;
import com.tripmates.backend.utils.PlanBuilder;
import com.tripmates.backend.utils.updateMe.command.AccountUpdateCommand;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private PublicationRepository publicationRepository;

	@Autowired
	private PublicationNodeRepository publicationNodeRepository;

	@Autowired
	private AccountNodeRepository accountNodeRepository;

	@Autowired
	private StorageService storageService;

	/**
	 * Returns user with email `email`.
	 * @param email user's email.
	 * @return {@link Account User}.
	 */
	public AccountResumeResponseDTO getUserAccount(String email) {
		Account user = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		return AccountResumeResponseDTO.fromAccount(user);
	}

	/**
	 * Updates the profile of the user with email `email`.
	 * @param email user's email.
	 * @param accountUpdateRequestDTO user's information to update.
	 * @param imageFiles user's images files.
	 * @param avatar user's avatar.
	 * @return {@link AccountResumeResponseDTO}.
	 */
	public AccountResumeResponseDTO updateUserAccount(String email, AccountUpdateRequestDTO accountUpdateRequestDTO,
			List<MultipartFile> imageFiles, MultipartFile avatar) {
		List<AccountUpdateCommand> commands = accountUpdateRequestDTO.toCommands(storageService);
		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		for (AccountUpdateCommand command : commands)
			account = command.apply(account);

		updateAvatar(account, avatar);
		updateProfileImages(account, imageFiles);

		return AccountResumeResponseDTO.fromAccount(accountRepository.save(account));
	}

	/**
	 * Returns a page with accounts that match the filters.
	 * @param businessSearchRequestDTO filters.
	 * @param pageable pages configuration.
	 * @return a page of {@link AccountResumeResponseDTO}.
	 */
	public Page<AccountResumeResponseDTO> searchBusiness(BusinessSearchRequestDTO businessSearchRequestDTO,
			Pageable pageable) {
		return accountRepository.searchBusiness(businessSearchRequestDTO, pageable)
			.map(AccountResumeResponseDTO::fromAccount);
	}

	/**
	 * Returns a page with accounts that match the filters.
	 * @param userSearchRequestDTO filters.
	 * @param pageable pages configuration.
	 * @return a page of {@link AccountResumeResponseDTO}.
	 */
	public Page<AccountResumeResponseDTO> searchUser(UserSearchRequestDTO userSearchRequestDTO, Pageable pageable) {
		return accountRepository.searchUser(userSearchRequestDTO, pageable).map(AccountResumeResponseDTO::fromAccount);
	}

	/**
	 * Follows a user.
	 * @param followerEmail follower's email.
	 * @param followedUserId followed user's ID.
	 */
	public void followUser(String followerEmail, String followedUserId) {
		Account follower = accountRepository.findByEmail(followerEmail)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		Account followed = accountRepository.findById(followedUserId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		checkFollowingInteractionBetweenTwoUsers(follower, followed);

		addFollowingInfoOnAccount(follower.getId(), followedUserId);
	}

	/**
	 * Unfollows a user.
	 * @param unfollowerEmail unfollower's email.
	 * @param unfollowedUserId unfollowed user's ID.
	 */
	public void unfollowUser(String unfollowerEmail, String unfollowedUserId) {
		Account unfollower = accountRepository.findByEmail(unfollowerEmail)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		Account unfollowed = accountRepository.findById(unfollowedUserId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		checkFollowingInteractionBetweenTwoUsers(unfollower, unfollowed);

		removeFollowingInfoOnAccount(unfollower.getId(), unfollowedUserId);
	}

	/**
	 * Checks if the interaction (follow / unfollow) between two users is valid.
	 * @param follower follower's account.
	 * @param followed followed user's account.
	 */
	private void checkFollowingInteractionBetweenTwoUsers(Account follower, Account followed) {
		if (follower.getId().equals(followed.getId()))
			throw new BadRequestException(ValidationErrorMessage.CANNOT_FOLLOW_UNFOLLOW_YOURSELF);

		if (follower.getRole() != Role.USER)
			throw new BadRequestException(ValidationErrorMessage.UNAUTHORIZED);

		if (followed.getRole() != Role.USER)
			throw new BadRequestException(ValidationErrorMessage.CANNOT_FOLLOW_UNFOLLOW_BUSINESS);
	}

	/**
	 * Removes following info on account.
	 * @param followerUserId follower's ID.
	 * @param followedUserId followed user's ID.
	 */
	private void removeFollowingInfoOnAccount(String followerUserId, String followedUserId) {
		long isFollowing = accountRepository.existsFollowing(followerUserId, followedUserId);
		long isFollower = accountRepository.existsFollowers(followedUserId, followerUserId);

		if (isFollowing == 0 || isFollower == 0)
			throw new BadRequestException(ValidationErrorMessage.CANNOT_UNFOLLOW_SOMEONE_YOU_ARE_NOT_FOLLOWING);

		accountRepository.removeFromFollowings(followerUserId, followedUserId);
		accountRepository.removeFromFollowers(followedUserId, followerUserId);
		accountNodeRepository.removeFollow(followerUserId, followedUserId);
	}

	/**
	 * Adds following info on account.
	 * @param whoId who's following.
	 * @param followedUserId followed user's ID.
	 */
	private void addFollowingInfoOnAccount(String whoId, String followedUserId) {
		long isFollowing = accountRepository.existsFollowing(whoId, followedUserId);
		long isFollower = accountRepository.existsFollowers(followedUserId, whoId);

		if (isFollowing > 0 || isFollower > 0)
			throw new BadRequestException(ValidationErrorMessage.CANNOT_FOLLOW_SOMEONE_YOU_ARE_ALREADY_FOLLOWING);

		accountRepository.addToFollowings(whoId, followedUserId);
		accountRepository.addToFollowers(followedUserId, whoId);
		accountNodeRepository.createFollow(whoId, followedUserId);
	}

	/**
	 * Updates user's avatar.
	 * @param account user's account.
	 * @param avatar user's new avatar.
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
	 * Updates user's profile images.
	 * @param account user's account.
	 * @param imageFiles user's images files.
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
	 * Creates a new user plan.
	 * @param email user's email.
	 * @param planCreationRequestDTO plan's information.
	 */
	public void createPlan(String email, PlanCreationRequestDTO planCreationRequestDTO) {
		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (account.getRole() != Role.USER)
			throw new BadRequestException(ValidationErrorMessage.UNAUTHORIZED);

		PlanBuilder planBuilder = new PlanBuilder().planDetails(planCreationRequestDTO).owner(account);

		if (account.getPlansList() == null)
			account.setPlansList(new ArrayList<>());

		account.getPlansList().add(planBuilder.build());

		accountRepository.save(account);
	}

	/**
	 * Obtains all user's plans.
	 * @param email user's email.
	 * @return a list of {@link PlanResumeResponseDTO}.
	 */
	public List<PlanResumeResponseDTO> getPlans(String email) {
		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

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

	/**
	 * Adds a new menu item to the business's restaurant account.
	 * @param email business's email.
	 * @param menuItem new menu item.
	 * @param multipartFileList images of the menu item.
	 * @return {@link AccountResumeResponseDTO}.
	 */
	public AccountResumeResponseDTO addMenuItem(String email, MenuItem menuItem,
			List<MultipartFile> multipartFileList) {
		Account account = getRestaurantAccount(email);

		List<String> imageURLsList = uploadImages(multipartFileList);
		if (menuItem.photosURLs() != null)
			imageURLsList.addAll(menuItem.photosURLs());

		List<MenuItem> menuItemList = account.getMenu() != null ? account.getMenu() : new ArrayList<>();

		menuItemList.add(new MenuItem(imageURLsList, menuItem.foodName(), menuItem.price(), menuItem.description()));

		account.setMenu(menuItemList);

		return AccountResumeResponseDTO.fromAccount(accountRepository.save(account));
	}

	/**
	 * Updates a menu item from the business's restaurant account.
	 * @param email business's email.
	 * @param index menu item index.
	 * @param updatedMenuItem new menu item.
	 * @param multipartFileList images URLs list.
	 * @param deleteImageIndexList images to delete indexes list.
	 * @return {@link AccountResumeResponseDTO}.
	 */
	public AccountResumeResponseDTO updateMenuItem(String email, int index, MenuItem updatedMenuItem,
			List<MultipartFile> multipartFileList, List<Integer> deleteImageIndexList) {
		Account account = getRestaurantAccount(email);

		List<MenuItem> menuItemList = account.getMenu();
		if (menuItemList == null)
			throw new BadRequestException(ValidationErrorMessage.NOTHING_TO_UPDATE);

		if (index < 0 || index >= menuItemList.size())
			throw new BadRequestException(ValidationErrorMessage.INDEX_OUT_OF_RANGE);

		MenuItem menuItem = menuItemList.get(index);

		List<String> imageURLsList = updateImages(menuItem.photosURLs(), deleteImageIndexList, multipartFileList);
		String foodName = (updatedMenuItem != null && updatedMenuItem.foodName() != null) ? updatedMenuItem.foodName()
				: menuItem.foodName();
		Float price = (updatedMenuItem != null && updatedMenuItem.price() != null) ? updatedMenuItem.price()
				: menuItem.price();
		String description = (updatedMenuItem != null && updatedMenuItem.description() != null)
				? updatedMenuItem.description() : menuItem.description();

		menuItemList.set(index, new MenuItem(imageURLsList, foodName, price, description));
		account.setMenu(menuItemList);

		return AccountResumeResponseDTO.fromAccount(accountRepository.save(account));
	}

	/**
	 * Removes a menu item from a business's restaurant account.
	 * @param email business's email.
	 * @param index menu item index.
	 * @return {@link AccountResumeResponseDTO}.
	 */
	public AccountResumeResponseDTO deleteMenuItem(String email, int index) {
		Account account = getRestaurantAccount(email);

		List<MenuItem> menuItemList = account.getMenu();
		if (menuItemList == null)
			throw new BadRequestException(ValidationErrorMessage.NOTHING_TO_DELETE);

		if (index < 0 || index >= menuItemList.size())
			throw new BadRequestException(ValidationErrorMessage.INDEX_OUT_OF_RANGE);

		if (menuItemList.get(index) != null) {
			List<String> imageURLsList = menuItemList.get(index).photosURLs();
			for (String imageURL : imageURLsList) {
				if (imageURL != null)
					storageService.deleteByUrl(imageURL);
			}
		}

		menuItemList.remove(index);
		account.setMenu(menuItemList);

		return AccountResumeResponseDTO.fromAccount(accountRepository.save(account));
	}

	/**
	 * Adds a new room pack to the business's hosting account.
	 * @param email business's email.
	 * @param roomPack new room pack.
	 * @param multipartFileList images of the room pack.
	 * @return {@link AccountResumeResponseDTO}.
	 */
	public AccountResumeResponseDTO addRoomPack(String email, RoomPack roomPack,
			List<MultipartFile> multipartFileList) {
		Account account = getHostingAccount(email);

		List<String> imageURLsList = uploadImages(multipartFileList);
		if (roomPack.photosURLs() != null)
			imageURLsList.addAll(roomPack.photosURLs());

		List<RoomPack> roomPackList = account.getRoomPacks() != null ? account.getRoomPacks() : new ArrayList<>();

		roomPackList.add(new RoomPack(roomPack.checkInDate(), roomPack.checkOutDate(), roomPack.numberOfGuests(),
				roomPack.services(), roomPack.price(), roomPack.description(), imageURLsList));

		account.setRoomPacks(roomPackList);

		return AccountResumeResponseDTO.fromAccount(accountRepository.save(account));
	}

	/**
	 * Updates a room pack from the business's hosting account.
	 * @param email business's email.
	 * @param index room pack index.
	 * @param updatedRoomPack new room pack.
	 * @param multipartFileList images URLs list.
	 * @param deleteImageIndexList images to delete indexes list.
	 * @return {@link AccountResumeResponseDTO}.
	 */
	public AccountResumeResponseDTO updateRoomPack(String email, int index, RoomPack updatedRoomPack,
			List<MultipartFile> multipartFileList, List<Integer> deleteImageIndexList) {
		Account account = getHostingAccount(email);

		List<RoomPack> roomPackList = account.getRoomPacks();
		if (roomPackList == null)
			throw new BadRequestException(ValidationErrorMessage.NOTHING_TO_UPDATE);

		if (index < 0 || index >= roomPackList.size())
			throw new BadRequestException(ValidationErrorMessage.INDEX_OUT_OF_RANGE);

		RoomPack roomPack = roomPackList.get(index);

		List<String> imageURLsList = updateImages(roomPack.photosURLs(), deleteImageIndexList, multipartFileList);
		LocalDate checkInDate = (updatedRoomPack != null && updatedRoomPack.checkInDate() != null)
				? updatedRoomPack.checkInDate() : roomPack.checkInDate();
		LocalDate checkOutDate = (updatedRoomPack != null && updatedRoomPack.checkOutDate() != null)
				? updatedRoomPack.checkOutDate() : roomPack.checkOutDate();
		Integer numberOfGuests = (updatedRoomPack != null && updatedRoomPack.numberOfGuests() != null)
				? updatedRoomPack.numberOfGuests() : roomPack.numberOfGuests();
		List<String> servicesList = (updatedRoomPack != null && updatedRoomPack.services() != null)
				? updatedRoomPack.services() : roomPack.services();
		Float price = (updatedRoomPack != null && updatedRoomPack.price() != null) ? updatedRoomPack.price()
				: roomPack.price();
		String description = (updatedRoomPack != null && updatedRoomPack.description() != null)
				? updatedRoomPack.description() : roomPack.description();

		roomPackList.set(index, new RoomPack(checkInDate, checkOutDate, numberOfGuests, servicesList, price,
				description, imageURLsList));
		account.setRoomPacks(roomPackList);

		return AccountResumeResponseDTO.fromAccount(accountRepository.save(account));
	}

	/**
	 * Removes a room pack from a business's hosting account.
	 * @param email business's email.
	 * @param index room pack index.
	 * @return {@link AccountResumeResponseDTO}.
	 */
	public AccountResumeResponseDTO deleteRoomPack(String email, int index) {
		Account account = getHostingAccount(email);

		List<RoomPack> roomPackList = account.getRoomPacks();
		if (roomPackList == null)
			throw new BadRequestException(ValidationErrorMessage.NOTHING_TO_DELETE);

		if (index < 0 || index >= roomPackList.size())
			throw new BadRequestException(ValidationErrorMessage.INDEX_OUT_OF_RANGE);

		if (roomPackList.get(index) != null) {
			List<String> imageURLsList = roomPackList.get(index).photosURLs();
			for (String imageURL : imageURLsList) {
				if (imageURL != null)
					storageService.deleteByUrl(imageURL);
			}
		}

		roomPackList.remove(index);
		account.setRoomPacks(roomPackList);

		return AccountResumeResponseDTO.fromAccount(accountRepository.save(account));
	}

	/**
	 * Returns a business's restaurant account by its email. If it ain't a business's
	 * restaurant account, it throws an exception.
	 * @param email user's email.
	 * @return {@link Account}.
	 */
	private Account getRestaurantAccount(String email) {
		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);

		if (account.getBusinessType() != BusinessType.RESTAURANT)
			throw new BadRequestException(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT);

		return account;
	}

	/**
	 * Returns a business's hosting account by its email. If it ain't a business's hosting
	 * account, it throws an exception.
	 * @param email user's email.
	 * @return {@link Account}.
	 */
	private Account getHostingAccount(String email) {
		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);

		if (account.getBusinessType() != BusinessType.HOTEL)
			throw new BadRequestException(ValidationErrorMessage.NOT_HOTEL_ACCOUNT);

		return account;
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

	public void updatePlan(String email, String planId, PlanUpdateRequestDTO planUpdateRequestDTO) {
		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (account.getRole() != Role.USER)
			throw new BadRequestException(ValidationErrorMessage.UNAUTHORIZED);

		List<Plan> plans = account.getPlansList();
		if (plans == null || plans.isEmpty())
			throw new BadRequestException(ValidationErrorMessage.NOTHING_TO_UPDATE);

		Plan target = null;
		for (Plan p : plans) {
			if (p != null && Objects.equals(p.getId(), planId)) {
				target = p;
				break;
			}
		}

		if (target == null)
			throw new BadRequestException(ValidationErrorMessage.NOTHING_TO_UPDATE);

		if (!Objects.equals(target.getOwnerId(), account.getId()))
			throw new BadRequestException(ValidationErrorMessage.UNAUTHORIZED);

		if (planUpdateRequestDTO != null) {
			if (planUpdateRequestDTO.name() != null)
				target.setName(planUpdateRequestDTO.name());
			if (planUpdateRequestDTO.description() != null)
				target.setDescription(planUpdateRequestDTO.description());

			// delete publications by 0-based indexes if provided (do this first to avoid
			// index shifts)
			if (planUpdateRequestDTO.deletePublicationIndexes() != null
					&& !planUpdateRequestDTO.deletePublicationIndexes().isEmpty()) {
				List<String> pubs = target.getPublicationsIdList();
				if (pubs == null || pubs.isEmpty())
					throw new BadRequestException(ValidationErrorMessage.NOTHING_TO_UPDATE);

				// remove in descending order to avoid reindex issues
				List<Integer> toDelete = new ArrayList<>(planUpdateRequestDTO.deletePublicationIndexes());
				toDelete.sort(Comparator.reverseOrder());
				for (Integer i : toDelete) {
					if (i == null || i < 0 || i >= pubs.size())
						throw new BadRequestException(ValidationErrorMessage.INDEX_OUT_OF_RANGE);
					pubs.remove(i.intValue());
				}
				target.setPublicationsIdList(pubs);
			}

			// then append new publications
			if (planUpdateRequestDTO.publicationsIdList() != null) {
				List<String> pubs = target.getPublicationsIdList();
				if (pubs == null)
					pubs = new ArrayList<>();
				pubs.addAll(planUpdateRequestDTO.publicationsIdList());
				target.setPublicationsIdList(pubs);
			}
		}

		accountRepository.save(account);
	}

	/**
	 * Removes one publication from a user's owned plan by its 0-based index.
	 * @param email user's email.
	 * @param planId plan identifier.
	 * @param index 0-based index of the publication to remove.
	 */
	public void deletePlanPublication(String email, String planId, int index) {
		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (account.getRole() != Role.USER)
			throw new BadRequestException(ValidationErrorMessage.UNAUTHORIZED);

		List<Plan> plans = account.getPlansList();
		if (plans == null || plans.isEmpty())
			throw new BadRequestException(ValidationErrorMessage.NOTHING_TO_DELETE);

		Plan target = null;
		for (Plan p : plans) {
			if (p != null && Objects.equals(p.getId(), planId)) {
				target = p;
				break;
			}
		}

		if (target == null)
			throw new BadRequestException(ValidationErrorMessage.NOTHING_TO_DELETE);

		if (!Objects.equals(target.getOwnerId(), account.getId()))
			throw new BadRequestException(ValidationErrorMessage.UNAUTHORIZED);

		List<String> pubs = target.getPublicationsIdList();
		if (pubs == null || pubs.isEmpty())
			throw new BadRequestException(ValidationErrorMessage.NOTHING_TO_DELETE);

		if (index < 0 || index >= pubs.size())
			throw new BadRequestException(ValidationErrorMessage.INDEX_OUT_OF_RANGE);

		pubs.remove(index);
		target.setPublicationsIdList(pubs);
		accountRepository.save(account);
	}

	public void deletePlan(String email, String planId) {
		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));

		if (account.getRole() != Role.USER)
			throw new BadRequestException(ValidationErrorMessage.UNAUTHORIZED);

		List<Plan> plans = account.getPlansList();
		if (plans == null || plans.isEmpty())
			throw new BadRequestException(ValidationErrorMessage.NOTHING_TO_DELETE);

		int index = -1;
		for (int i = 0; i < plans.size(); i++) {
			Plan p = plans.get(i);
			if (p != null && Objects.equals(p.getId(), planId)) {
				if (!Objects.equals(p.getOwnerId(), account.getId()))
					throw new BadRequestException(ValidationErrorMessage.UNAUTHORIZED);
				index = i;
				break;
			}
		}

		if (index == -1)
			throw new BadRequestException(ValidationErrorMessage.NOTHING_TO_DELETE);

		plans.remove(index);
		account.setPlansList(plans);
		accountRepository.save(account);
	}

	private List<AccountResumeResponseDTO> formatAccountIdList(List<String> idList) {
		return idList.stream()
			.map((id) -> AccountResumeResponseDTO.fromAccount(accountRepository.findById(id)
				.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND))))
			.collect(Collectors.toList());
	}

	public List<AccountResumeResponseDTO> getFollowingsByEmail(String email) {
		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		return formatAccountIdList(account.getFollowings());
	}

	public List<AccountResumeResponseDTO> getFollowersByEmail(String email) {
		Account account = accountRepository.findByEmail(email)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		return formatAccountIdList(account.getFollowers());
	}

	public List<AccountResumeResponseDTO> getFollowingsByUserId(String userId) {
		Account account = accountRepository.findById(userId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		return formatAccountIdList(account.getFollowings());
	}

	public List<AccountResumeResponseDTO> getFollowersByUserId(String userId) {
		Account account = accountRepository.findById(userId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		return formatAccountIdList(account.getFollowers());
	}

	/**
	 * Given a user's ID, returns all user accounts that may bee to its interest.
	 * @param userId users account ID.
	 * @return list of {@link AccountResumeResponseDTO}.
	 */
	public List<AccountResumeResponseDTO> getUserAccountRecommendation(String userId) {
		List<AccountNode> accountNodeList = accountNodeRepository.findAllAccountsRelated(userId);

		List<AccountResumeResponseDTO> accountResumeResponseDTOList = new ArrayList<>();
		for (AccountNode accountNode : accountNodeList) {
			accountRepository.findById(accountNode.getId()).ifPresent((account) -> {
				accountResumeResponseDTOList.add(AccountResumeResponseDTO.fromAccount(account));
			});
		}

		return accountResumeResponseDTOList;
	}

    /**
     * Given a user's ID, returns all business accounts that may bee to its interest.
     * @param userId users account ID.
     * @return list of {@link AccountResumeResponseDTO}.
     */
    public List<AccountResumeResponseDTO> getBusinessAccountRecommendation(String userId) {
        List<AccountNode> accountNodeList = accountNodeRepository.findAllBusinessRelated(userId);

        List<AccountResumeResponseDTO> accountResumeResponseDTOList = new ArrayList<>();
        for (AccountNode accountNode : accountNodeList) {
            accountRepository.findById(accountNode.getId()).ifPresent((account) -> {
                accountResumeResponseDTOList.add(AccountResumeResponseDTO.fromAccount(account));
            });
        }

        return accountResumeResponseDTOList;
    }

	@Transactional(readOnly = true)
	public Page<PublicationResumeResponseDTO> getPublicationRecommendations(String userId, Pageable pageable) {
		// Get recommended publication nodes from Neo4j with pagination
		List<PublicationNode> recommendedNodes = publicationNodeRepository.findRecommendedPublications(userId,
				(int) pageable.getOffset(), pageable.getPageSize());

		// If no recommendations from reviews, return empty page
		if (recommendedNodes.isEmpty()) {
			return Page.empty(pageable);
		}

		// Convert to MongoDB IDs
		List<String> publicationIds = recommendedNodes.stream()
			.map(PublicationNode::getId)
			.collect(Collectors.toList());

		// Get total count for pagination
		long total = publicationNodeRepository.countRecommendedPublications(userId);

		// Fetch full publication details from MongoDB
		List<PublicationResumeResponseDTO> content = publicationRepository.findAllById(publicationIds)
			.stream()
			.map(publication -> {
				Account owner = accountRepository.findById(publication.getOwnerId())
					.orElseThrow(() -> new NotFoundException("Account not found with id: " + publication.getOwnerId()));

				return new PublicationResumeResponseDTO(publication.getId(), publication.getTitle(),
						publication.getDescription(), publication.getOpeningDays(), publication.getAttentionSchedule(),
						publication.getExceptionalClosingDays(), publication.getImageUrls(), publication.getTags(),
						publication.getCreatedAt(), publication.getPhoneNumber(), publication.getEmail(),
						publication.getLocation(), owner.getId(), owner.getUsername(), owner.getAvatarURL());
			})
			.collect(Collectors.toList());

		return new PageImpl<>(content, pageable, total);
	}

}
