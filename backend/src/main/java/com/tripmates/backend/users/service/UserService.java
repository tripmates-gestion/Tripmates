package com.tripmates.backend.users.service;

import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.users.dto.AccountResumeResponseDTO;
import com.tripmates.backend.users.dto.AccountSearchRequestDTO;
import com.tripmates.backend.users.dto.UserUpdateRequestDTO;
import com.tripmates.backend.common.types.MenuItem;
import com.tripmates.backend.common.types.RoomPack;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRespository;
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
     * Actualiza un item del menú por índice, subiendo opcionalmente sus fotos.
     */
    public AccountResumeResponseDTO updateMenuItem(String email, int index, MenuItem item, List<MultipartFile> files) {
        Account account = accountRespository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
        if (account.getRole() != Role.BUSINESS)
            throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
        if (account.getBusinessType() != BusinessType.RESTAURANT)
            throw new BadRequestException(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT);

        List<MenuItem> current = account.getMenu() != null ? new ArrayList<>(account.getMenu()) : new ArrayList<>();
        if (index < 0 || index >= current.size())
            throw new BadRequestException("Invalid menu index");

        List<String> urls = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty() || file.getSize() == 0) continue;
                urls.add(storageService.uploadFile(file));
            }
        }
        List<String> mergedPhotos = new ArrayList<>();
        if (item.photosURLs() != null) mergedPhotos.addAll(item.photosURLs());
        mergedPhotos.addAll(urls);

        current.set(index, new MenuItem(mergedPhotos, item.foodName(), item.price(), item.description()));
        account.setMenu(current);
        return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
    }

    /**
     * Elimina un item del menú por índice.
     */
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
        current.remove(index);
        account.setMenu(current);
        return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
    }

    /**
     * Actualiza un room pack por índice, subiendo opcionalmente sus fotos.
     */
    public AccountResumeResponseDTO updateRoomPack(String email, int index, RoomPack pack, List<MultipartFile> files) {
        Account account = accountRespository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
        if (account.getRole() != Role.BUSINESS)
            throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
        if (account.getBusinessType() != BusinessType.HOTEL)
            throw new BadRequestException(ValidationErrorMessage.NOT_HOTEL_ACCOUNT);

        List<RoomPack> current = account.getRoomPacks() != null ? new ArrayList<>(account.getRoomPacks()) : new ArrayList<>();
        if (index < 0 || index >= current.size())
            throw new BadRequestException("Invalid room pack index");

        List<String> urls = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty() || file.getSize() == 0) continue;
                urls.add(storageService.uploadFile(file));
            }
        }
        List<String> mergedPhotos = new ArrayList<>();
        if (pack.photosURLs() != null) mergedPhotos.addAll(pack.photosURLs());
        mergedPhotos.addAll(urls);

        current.set(index, new RoomPack(pack.checkInDate(), pack.checkOutDate(), pack.numberOfGuests(), pack.services(),
                pack.price(), pack.description(), mergedPhotos));
        account.setRoomPacks(current);
        return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
    }

    /**
     * Elimina un room pack por índice.
     */
    public AccountResumeResponseDTO deleteRoomPack(String email, int index) {
        Account account = accountRespository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
        if (account.getRole() != Role.BUSINESS)
            throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
        if (account.getBusinessType() != BusinessType.HOTEL)
            throw new BadRequestException(ValidationErrorMessage.NOT_HOTEL_ACCOUNT);

        List<RoomPack> current = account.getRoomPacks() != null ? new ArrayList<>(account.getRoomPacks()) : new ArrayList<>();
        if (index < 0 || index >= current.size())
            throw new BadRequestException("Invalid room pack index");
        current.remove(index);
        account.setRoomPacks(current);
        return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
    }

    /**
     * Agrega un item al menú (RESTO) subiendo opcionalmente sus fotos.
     */
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
                if (file == null || file.isEmpty() || file.getSize() == 0) continue;
                urls.add(storageService.uploadFile(file));
            }
        }

        List<String> mergedPhotos = new ArrayList<>();
        if (item.photosURLs() != null) mergedPhotos.addAll(item.photosURLs());
        mergedPhotos.addAll(urls);

        MenuItem newItem = new MenuItem(mergedPhotos, item.foodName(), item.price(), item.description());
        List<MenuItem> current = account.getMenu() != null ? account.getMenu() : new ArrayList<>();
        current.add(newItem);
        account.setMenu(current);
        return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
    }

    /**
     * Agrega un room pack (HOTEL) subiendo opcionalmente sus fotos.
     */
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
                if (file == null || file.isEmpty() || file.getSize() == 0) continue;
                urls.add(storageService.uploadFile(file));
            }
        }

        List<String> mergedPhotos = new ArrayList<>();
        if (pack.photosURLs() != null) mergedPhotos.addAll(pack.photosURLs());
        mergedPhotos.addAll(urls);

        RoomPack newPack = new RoomPack(pack.checkInDate(), pack.checkOutDate(), pack.numberOfGuests(), pack.services(),
                pack.price(), pack.description(), mergedPhotos);
        List<RoomPack> current = account.getRoomPacks() != null ? account.getRoomPacks() : new ArrayList<>();
        current.add(newPack);
        account.setRoomPacks(current);
        return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
    }

    /**
     * Sube N fotos para el menú del restaurante y retorna sus URLs (ordenadas como fueron recibidas).
     */
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
                if (file == null || file.isEmpty() || file.getSize() == 0) continue;
                urls.add(storageService.uploadFile(file));
            }
        }
        return urls;
    }

    /**
     * Sube N fotos para los room packs del hotel y retorna sus URLs (ordenadas como fueron recibidas).
     */
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
                if (file == null || file.isEmpty() || file.getSize() == 0) continue;
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
     * Reemplaza el menú del restaurante usando archivos por convención de nombres: menu-<itemIndex>-<photoIndex>.*
     */
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
                if (file == null || file.isEmpty() || file.getSize() == 0) continue;
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
            } else if (item.photosURLs() != null) {
                photos.addAll(item.photosURLs());
            }
            newMenu.add(new MenuItem(photos, item.foodName(), item.price(), item.description()));
        }

        account.setMenu(newMenu);
        return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
    }

    /**
     * Reemplaza los room packs del hotel usando archivos por convención: roompack-<packIndex>-<photoIndex>.*
     */
    public AccountResumeResponseDTO updateHostingRoomPacks(String email, List<RoomPack> roomPacks, List<MultipartFile> files) {
        Account account = accountRespository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
        if (account.getRole() != Role.BUSINESS)
            throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
        if (account.getBusinessType() != BusinessType.HOTEL)
            throw new BadRequestException(ValidationErrorMessage.NOT_HOTEL_ACCOUNT);

        Map<String, String> uploadedByName = new HashMap<>();
        if (files != null) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty() || file.getSize() == 0) continue;
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
            } else if (rp.photosURLs() != null) {
                photos.addAll(rp.photosURLs());
            }
            newPacks.add(new RoomPack(rp.checkInDate(), rp.checkOutDate(), rp.numberOfGuests(), rp.services(),
                    rp.price(), rp.description(), photos));
        }

        account.setRoomPacks(newPacks);
        return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
    }

    private static Map<Integer, Map<Integer, String>> indexByPosition(Map<String, String> uploadedByName, Pattern pattern) {
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
