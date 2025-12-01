package com.tripmates.backend.seeder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripmates.backend.auth.dto.AuthLoginRequestDTO;
import com.tripmates.backend.auth.dto.AuthLoginResponseDTO;
import com.tripmates.backend.auth.dto.AuthRegisterRequestDTO;
import com.tripmates.backend.auth.service.AuthService;
import com.tripmates.backend.common.types.*;
import com.tripmates.backend.users.dto.account.AccountUpdateRequestDTO;
import com.tripmates.backend.users.service.UserService;
import com.tripmates.backend.publications.dto.PublicationRequestDTO;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
import com.tripmates.backend.publications.dto.ReviewCreationRequestDTO;
import com.tripmates.backend.publications.service.PublicationService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import com.tripmates.backend.seeder.UserCredentialsWrapper;

@Component
@Profile("dev")
public class DatabaseSeeder implements CommandLineRunner {

	private final AuthService authService;

	private final UserService userService;

	private final PublicationService publicationService;

	// email -> accessToken
	private final Map<String, String> tokens = new HashMap<>();

	// IDs de publicaciones creadas, para reviews y likes
	private final List<String> publicationIds = new ArrayList<>();

	// Publicaciones por negocio (email negocio -> lista de IDs de publicaciones)
	private final Map<String, List<String>> businessPublicationIds = new HashMap<>();

	public DatabaseSeeder(AuthService authService, UserService userService, PublicationService publicationService) {
		this.authService = authService;
		this.userService = userService;
		this.publicationService = publicationService;
	}

	@Override
	public void run(String... args) {
		System.out.println("=== DatabaseSeeder (dev) iniciado ===");
		try {
			registerAllUsers();
			loginAllUsers();
			updateBusinessProfiles();
			seedPublications();
			seedRoomPacks();
			seedMenuItems();
			seedReviews();
			seedLikes();
			seedFollows();
			updateUserAvatars();
			updateBusinessImages();
			System.out.println("=== DatabaseSeeder finalizado OK ===");
		} catch (Exception e) {
			System.err.println("Error al ejecutar el seeder: " + e.getMessage());
			e.printStackTrace();
		}
	}

    private void registerAllUsers() {
        System.out.println("--- Registrando usuarios desde JSON ---");
        
        try {
            // Cargar el archivo JSON
            ObjectMapper objectMapper = new ObjectMapper();
            ClassPathResource resource = new ClassPathResource("config/data/user-credentials.json");
            
            // Leer el JSON
            UserCredentialsWrapper wrapper = objectMapper.readValue(resource.getInputStream(), UserCredentialsWrapper.class);
            
            // Registrar cada usuario
            for (UserCredentials user : wrapper.getUsers()) {
                registerUser(
                    user.getName(),
                    user.getEmail(),
                    user.getPassword(),
                    user.getRole(),
                    user.getBusinessType()
                );
            }
            
            System.out.println("--- Usuarios registrados exitosamente ---");
        } catch (IOException e) {
            System.err.println("Error al leer el archivo de credenciales: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("No se pudo cargar el archivo de credenciales de usuarios", e);
        }
    }

    private void registerUser(String name, String email, String password, Role role, BusinessType businessType) {
        try {
            var dto = new AuthRegisterRequestDTO(name, email, password, role, businessType);
            authService.register(dto);
            System.out.println("[REGISTER] OK -> " + email + " (" + role
                    + (businessType != null ? ", " + businessType : "") + ")");
        } catch (Exception e) {
            // Si ya existe, lo informamos y seguimos (igual que el script, que no falla
            // fuerte)
            System.err.println("[REGISTER] Error para " + email + ": " + e.getMessage());
        }
    }

    private void loginAllUsers() {
        System.out.println("--- Logueando usuarios para obtener tokens ---");
        try {
            // Load user credentials from JSON file
            ObjectMapper objectMapper = new ObjectMapper();
            UserCredentialsWrapper wrapper = objectMapper.readValue(
                getClass().getClassLoader().getResourceAsStream("config/data/user-credentials.json"),
                UserCredentialsWrapper.class
            );

            // Login each user and store their token
            for (UserCredentials user : wrapper.getUsers()) {
                try {
                    AuthLoginRequestDTO loginRequest = new AuthLoginRequestDTO(user.getEmail(), user.getPassword());
                    AuthLoginResponseDTO response = authService.login(loginRequest);
                    tokens.put(user.getEmail(), response.accessToken());
                    System.out.println("[LOGIN] OK -> " + user.getEmail());
                } catch (Exception e) {
                    System.err.println("[LOGIN] Error para " + user.getEmail() + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("Error loading user credentials: " + e.getMessage());
        }
	}

	private void seedPublications() {
		System.out.println("--- Creando publicaciones de negocios (con imágenes) ---");

		// Restaurante La Buena Mesa
		createPublication("info@labuenamesa.com",
			"Menú Especial de Otoño",
			"Disfrutá de nuestro menú de temporada con ingredientes frescos y locales en La Buena Mesa.",
			"+54 11 1234-5678", "reservas@labuenamesa.com",
			new Location("Av. Corrientes 1234, Buenos Aires", -34.6037, -58.3816),
			List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
					DayOfWeek.FRIDAY, DayOfWeek.SATURDAY),
			new AttentionSchedule(LocalTime.parse("12:00"), LocalTime.parse("23:00")),
			List.of(), List.of("restaurante", "comida", "menú", "especial"),
			List.of("sample_images/publications/restaurant/cena1.jpg"));

		createPublication("info@labuenamesa.com",
			"Noche de Vinos",
			"Degustación de vinos de bodegas locales con maridaje exclusivo en La Buena Mesa.",
			"+54 11 1234-5678", "reservas@labuenamesa.com",
			new Location("Av. Corrientes 1234, Buenos Aires", -34.6037, -58.3816),
			List.of(DayOfWeek.FRIDAY, DayOfWeek.SATURDAY),
			new AttentionSchedule(LocalTime.parse("20:00"), LocalTime.parse("23:30")),
			List.of(), List.of("vinos", "degustación", "evento"),
			List.of("sample_images/publications/restaurant/vinos.jpeg"));

		createPublication("info@labuenamesa.com",
			"Brunch de Domingos",
			"Disfrutá de nuestro exclusivo brunch los domingos en La Buena Mesa.",
			"+54 11 1234-5678", "reservas@labuenamesa.com",
			new Location("Av. Corrientes 1234, Buenos Aires", -34.6037, -58.3816),
			List.of(DayOfWeek.SUNDAY),
			new AttentionSchedule(LocalTime.parse("10:00"), LocalTime.parse("15:00")),
			List.of(), List.of("brunch", "desayuno", "domingo"),
			List.of("sample_images/publications/restaurant/postre1.jpg"));

		// Café del Centro
		createPublication("contacto@cafedelcentro.com",
			"Café de Especialidad",
			"Disfrutá de nuestros cafés de especialidad tostados artesanalmente en Café del Centro.",
			"+54 11 9876-5432", "contacto@cafedelcentro.com",
			new Location("Av. Santa Fe 1234, Buenos Aires", -34.5895, -58.3816),
			List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
					DayOfWeek.FRIDAY, DayOfWeek.SATURDAY),
			new AttentionSchedule(LocalTime.parse("07:00"), LocalTime.parse("20:00")),
			List.of(), List.of("café", "especialidad", "tostado"),
			List.of("sample_images/publications/restaurant/cafe/cafe1.jpg"));

		createPublication("contacto@cafedelcentro.com",
			"Tardes de Té",
			"Relajate con nuestra selección de tés e infusiones con pastelería casera en Café del Centro.",
			"+54 11 9876-5432", "contacto@cafedelcentro.com",
			new Location("Av. Santa Fe 1234, Buenos Aires", -34.5895, -58.3816),
			List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
					DayOfWeek.FRIDAY, DayOfWeek.SATURDAY),
			new AttentionSchedule(LocalTime.parse("15:00"), LocalTime.parse("19:00")),
			List.of(), List.of("té", "infusiones", "pastelería"),
			List.of("sample_images/publications/restaurant/cafe/cafe2.jpg"));

		// Hostel Montaña Mágica
		createPublication("info@hostelmontana.com",
			"Aventura en la Montaña",
			"Paquete de aventura con caminatas guiadas y alojamiento en la naturaleza en Hostel Montaña.",
			"+54 294 123-4567", "info@hostelmontana.com",
			new Location("Ruta 234, San Carlos de Bariloche", -41.1335, -71.3103),
			List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
					DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY),
			new AttentionSchedule(LocalTime.parse("00:00"), LocalTime.parse("23:59")),
			List.of(), List.of("aventura", "montaña", "naturaleza"),
			List.of("sample_images/publications/hotel/habitacion1.jpg"));

		createPublication("info@hostelmontana.com",
			"Escape de Fin de Semana",
			"Escapada relajante con desayuno incluido y actividades al aire libre en Hostel Montaña.",
			"+54 294 123-4567", "info@hostelmontana.com",
			new Location("Ruta 234, San Carlos de Bariloche", -41.1335, -71.3103),
			List.of(DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY),
			new AttentionSchedule(LocalTime.parse("14:00"), LocalTime.parse("12:00")),
			List.of(), List.of("fin de semana", "relax", "naturaleza"),
			List.of("sample_images/publications/hotel/aventura1.jpg"));

		// Hotel Playa Dorada
		createPublication("reservas@playadorada.com",
			"Escape a la Playa - Oferta Especial",
			"Disfrutá de unas vacaciones inolvidables frente al mar con nuestro paquete todo incluido en Hotel Playa Dorada.",
			"+54 223 123-4567", "reservas@playadorada.com",
			new Location("Av. Costanera 2345, Mar del Plata", -38.0055, -57.5426),
			List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
					DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY),
			new AttentionSchedule(LocalTime.parse("00:00"), LocalTime.parse("23:59")),
			List.of(), List.of("hotel", "playa", "vacaciones", "todo incluido"),
			List.of("sample_images/publications/hotel/playa1.jpeg"));

		createPublication("reservas@playadorada.com",
			"Paquete Romántico",
			"Escapada romántica con cena gourmet y masajes para dos en Hotel Playa Dorada.",
			"+54 223 123-4567", "reservas@playadorada.com",
			new Location("Av. Costanera 2345, Mar del Plata", -38.0055, -57.5426),
			List.of(DayOfWeek.FRIDAY, DayOfWeek.SATURDAY),
			new AttentionSchedule(LocalTime.parse("14:00"), LocalTime.parse("23:00")),
			List.of(), List.of("romántico", "parejas", "especial"),
			List.of("sample_images/publications/hotel/deluxe1.jpeg"));

		createPublication("reservas@playadorada.com",
			"Paquete Familiar",
			"Diversión para toda la familia con actividades para niños y adultos en Hotel Playa Dorada.",
			"+54 223 123-4567", "reservas@playadorada.com",
			new Location("Av. Costanera 2345, Mar del Plata", -38.0055, -57.5426),
			List.of(DayOfWeek.SATURDAY, DayOfWeek.SUNDAY),
			new AttentionSchedule(LocalTime.parse("09:00"), LocalTime.parse("20:00")),
			List.of(), List.of("familiar", "niños", "actividades"),
			List.of("sample_images/publications/hotel/suite1.jpg"));

		// Brisa Marina
		createPublication("isabel@brisamarina.com",
			"Menú Degustación de Mariscos",
			"Disfrutá de una experiencia gastronómica única con los mejores frutos del mar en Brisa Marina.",
			"+54 223 456-7890", "reservas@brisamarina.com",
			new Location("Av. Costanera 1234, Mar del Plata", -38.0055, -57.5426),
			List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
					DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY),
			new AttentionSchedule(LocalTime.parse("12:30"), LocalTime.parse("23:00")),
			List.of(), List.of("mariscos", "gourmet", "vista al mar"),
			List.of("sample_images/publications/restaurant/mariscos1.jpeg"));

		createPublication("isabel@brisamarina.com",
			"Cena con Vista al Atardecer",
			"Vive una experiencia inolvidable con nuestra cena de 5 pasos mientras el sol se pone en el mar.",
			"+54 223 456-7890", "reservas@brisamarina.com",
			new Location("Av. Costanera 1234, Mar del Plata", -38.0055, -57.5426),
			List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
					DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY),
			new AttentionSchedule(LocalTime.parse("19:00"), LocalTime.parse("23:30")),
			List.of(), List.of("romántico", "vista al mar", "cena gourmet"),
			List.of("sample_images/publications/restaurant/atardecer1.jpeg"));

		// Sabores Peruanos
		createPublication("gaston@saboresperuanos.com",
			"Especialidad: Ceviche Tradicional",
			"Probá nuestro auténtico ceviche peruano preparado con pescado fresco y los mejores ingredientes.",
			"+54 11 4567-8901", "contacto@saboresperuanos.com",
			new Location("Av. Cabildo 2345, CABA", -34.5607, -58.4566),
			List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
					DayOfWeek.FRIDAY, DayOfWeek.SATURDAY),
			new AttentionSchedule(LocalTime.parse("12:00"), LocalTime.parse("23:30")),
			List.of(), List.of("ceviche", "comida peruana", "especialidad"),
			List.of("sample_images/publications/restaurant/ceviche1.jpg"));

		createPublication("gaston@saboresperuanos.com",
			"Noche de Pisco Sour",
			"Disfrutá de una noche de cócteles peruanos con música en vivo y tapas andinas.",
			"+54 11 4567-8901", "contacto@saboresperuanos.com",
			new Location("Av. Cabildo 2345, CABA", -34.5607, -58.4566),
			List.of(DayOfWeek.FRIDAY, DayOfWeek.SATURDAY),
			new AttentionSchedule(LocalTime.parse("20:00"), LocalTime.parse("01:00")),
			List.of(), List.of("pisco", "cócteles", "música en vivo"),
			List.of("sample_images/publications/restaurant/pisco1.jpg"));

		// El Encuentro Hostel
		createPublication("diego@elencuentrohostel.com",
			"Paquete Aventurero",
			"Para los viajeros que buscan acción, incluye alojamiento, desayuno y actividades de aventura.",
			"+54 294 567-8901", "aventura@elencuentrohostel.com",
			new Location("Ruta 40 km 2015, San Carlos de Bariloche", -41.1335, -71.3103),
			List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
					DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY),
			new AttentionSchedule(LocalTime.parse("00:00"), LocalTime.parse("23:59")),
			List.of(), List.of("aventura", "montañismo", "excursiones"),
			List.of("sample_images/publications/hotel/aventura2.jpg"));
	}

	private void seedRoomPacks() {
		System.out.println("--- Creando room packs para hosting ---");

		// Hotel Playa Dorada - 3 packs
		addRoomPack("reservas@playadorada.com",
			new RoomPack(LocalDate.parse("2025-12-20"), LocalDate.parse("2025-12-27"), 2,
				List.of("desayuno", "wifi", "piscina", "estacionamiento"),
				25000.0f,
				"Habitación Estándar con Vista al Mar - Habitación doble con vista al mar. Incluye desayuno buffet y acceso a todas las instalaciones del hotel.",
				List.of()),
			List.of("sample_images/publications/hotel/habitacion1.jpg"));

		addRoomPack("reservas@playadorada.com",
			new RoomPack(LocalDate.parse("2025-12-20"), LocalDate.parse("2025-12-27"), 2,
				List.of("desayuno", "wifi", "piscina", "estacionamiento", "minibar"),
				38000.0f,
				"Suite Familiar - Amplia suite con sala de estar y cama king size. Ideal para familias o grupos pequeños.",
				List.of()),
			List.of("sample_images/publications/hotel/suite1.jpg"));

		addRoomPack("reservas@playadorada.com",
			new RoomPack(LocalDate.parse("2025-12-20"), LocalDate.parse("2025-12-27"), 2,
				List.of("desayuno", "wifi", "piscina", "estacionamiento", "spa", "minibar"),
				45000.0f,
				"Habitación Deluxe - Lujosa habitación con jacuzzi y vista panorámica. Incluye acceso al spa y desayuno a la habitación.",
				List.of()),
			List.of("sample_images/publications/hotel/deluxe1.jpeg"));

		// Hostel Montaña - 2 packs
		addRoomPack("info@hostelmontana.com",
			new RoomPack(LocalDate.parse("2025-12-20"), LocalDate.parse("2025-12-27"), 2,
				List.of("wifi", "cocina_compartida", "area_comun"),
				8000.0f,
				"Habitación Compartida 4 Personas - Cama individual en habitación compartida con baño compartido. Ideal para mochileros y grupos jóvenes.",
				List.of()),
			List.of("sample_images/business_picture/hostel1.jpg"));

		addRoomPack("info@hostelmontana.com",
			new RoomPack(LocalDate.parse("2025-12-20"), LocalDate.parse("2025-12-27"), 2,
				List.of("wifi", "desayuno_simple", "bano_privado"),
				15000.0f,
				"Habitación Doble Privada - Habitación privada con cama matrimonial y baño privado. Perfecta para parejas.",
				List.of()),
			List.of("sample_images/business_picture/hostel2.jpg"));
	}

	private void seedMenuItems() {
		System.out.println("--- Creando ítems de menú para restaurantes ---");

		// La Buena Mesa
		addMenuItem("info@labuenamesa.com",
			"Milanesa Napolitana",
			3500.0f,
			"Milanesa de carne con salsa de tomate, jamón y queso gratinado. Acompañada con papas fritas.",
			"sample_images/menu_items/milanesa.jpeg");

		addMenuItem("info@labuenamesa.com",
			"Jugo de Naranja",
			700.0f,
			"Jugo de Naranja de primera calidad para acompañar la comida.",
			"sample_images/menu_items/bebida.jpg");

		// Café del Centro
		addMenuItem("contacto@cafedelcentro.com",
			"Café Especial",
			1200.0f,
			"Café artesanal de granos tostados localmente. Servido con medialuna de manteca.",
			"sample_images/menu_items/cafe1.jpg");

		addMenuItem("contacto@cafedelcentro.com",
			"Té de Hierbas",
			1000.0f,
			"Mezcla de hierbas aromáticas seleccionadas. Relajante y digestivo.",
			"sample_images/menu_items/cafe2.jpg");
	}

	private void addMenuItem(String businessEmail, String foodName, float price, String description,
			String imagePath) {
		try {
			MenuItem menuItem = new MenuItem(null, foodName, price, description);
			MultipartFile file = loadImage(imagePath);
			List<MultipartFile> files = (file != null) ? List.of(file) : List.of();
			userService.addMenuItem(businessEmail, menuItem, files.isEmpty() ? null : files);
			System.out.println("[MENU] Creado ítem '" + foodName + "' para " + businessEmail);
		}
		catch (Exception e) {
			System.err.println("[MENU] Error creando ítem '" + foodName + "' para " + businessEmail + ": "
					+ e.getMessage());
		}
	}

	private void addRoomPack(String businessEmail, RoomPack roomPack, List<String> imagePaths) {
		try {
			List<MultipartFile> files = imagePaths.stream().map(this::loadImage).filter(f -> f != null).toList();
			userService.addRoomPack(businessEmail, roomPack, files.isEmpty() ? null : files);
			System.out.println("[ROOMPACK] Creado room pack para " + businessEmail + " - "
					+ roomPack.description());
		}
		catch (Exception e) {
			System.err.println("[ROOMPACK] Error creando room pack para " + businessEmail + ": " + e.getMessage());
		}
	}

	private void createPublication(String businessEmail, String title, String description, String phoneNumber,
			String publicationEmail, Location location, List<DayOfWeek> openingDays, AttentionSchedule schedule,
			List<LocalDate> exceptionalClosingDays, List<String> tags, List<String> imagePaths) {
		try {
			PublicationRequestDTO dto = new PublicationRequestDTO(title, description, phoneNumber, publicationEmail,
					location, openingDays, schedule, exceptionalClosingDays, tags);
			List<MultipartFile> files = imagePaths.stream().map(this::loadImage).filter(f -> f != null).toList();
			PublicationResumeResponseDTO created = publicationService.createPublication(dto,
					files.isEmpty() ? null : files, businessEmail);
			if (created != null && created.id() != null) {
				publicationIds.add(created.id());
				businessPublicationIds.computeIfAbsent(businessEmail, k -> new ArrayList<>()).add(created.id());
			}
			System.out.println("[PUBLICATION] Creada publicación '" + title + "' para " + businessEmail
					+ " (id=" + created.id() + ")");
		}
		catch (Exception e) {
			System.err.println("[PUBLICATION] Error creando publicación '" + title + "' para " + businessEmail + ": "
					+ e.getMessage());
		}
	}

	private void updateUserAvatars() {
		System.out.println("--- Actualizando avatares de usuarios ---");

		updateUserAvatar("camila@example.com", "sample_images/profile_pictures/user1.png");
		updateUserAvatar("luisito@example.com", "sample_images/profile_pictures/user2.png");
		updateUserAvatar("julian@example.com", "sample_images/profile_pictures/user3.png");
		updateUserAvatar("joseluis@example.com", "sample_images/profile_pictures/user4.png");
		updateUserAvatar("ricardo@example.com", "sample_images/profile_pictures/user5.png");
		updateUserAvatar("astrid@example.com", "sample_images/profile_pictures/user6.png");
		updateUserAvatar("aizen@example.com", "sample_images/profile_pictures/user7.png");
	}

	private void updateUserAvatar(String email, String imagePath) {
		MultipartFile avatar = loadImage(imagePath);
		if (avatar == null) {
			System.err.println("[AVATAR] No se encontró la imagen para " + email + ": " + imagePath);
			return;
		}

		AccountUpdateRequestDTO dto = new AccountUpdateRequestDTO(null, null, null, null, null, null, null, null, null,
				null, null, null);
		userService.updateUserAccount(email, dto, null, avatar);
		System.out.println("[AVATAR] Actualizado avatar de " + email);
	}

	private void updateBusinessProfiles() {
		System.out.println("--- Actualizando perfiles de negocios ---");

		updateLaBuenaMesa();
		updateHotelPlayaDorada();
		updateCafeDelCentro();
		updateHostelMontania();
		updateBrisaMarina();
		updateSaboresPeruanos();
		updateElEncuentroHostel();
	}

	private void updateLaBuenaMesa() {
		Location location = new Location("Av. Corrientes 1234, Buenos Aires", -34.6037, -58.3816);
		AttentionSchedule schedule = new AttentionSchedule(LocalTime.parse("09:00"), LocalTime.parse("23:00"));
		List<DayOfWeek> openingDays = List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
				DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY);

		AccountUpdateRequestDTO dto = new AccountUpdateRequestDTO("La Buena Mesa",
			"Un restaurante familiar con los mejores platos de la cocina tradicional", location,
			"+54 11 1234-5678", "contacto@labuenamesa.com", AveragePrice.$$, RestaurantType.Argentino, schedule,
			openingDays, null, null, null);

		userService.updateUserAccount("info@labuenamesa.com", dto, null, null);
		System.out.println("[PROFILE] Actualizado perfil de La Buena Mesa");
	}

	private void updateHotelPlayaDorada() {
		Location location = new Location("Av. Costanera 2345, Mar del Plata", -38.0055, -57.5426);
		AccountUpdateRequestDTO dto = new AccountUpdateRequestDTO("Hotel Playa Dorada",
			"Un hotel de lujo frente al mar con todas las comodidades", location, "+54 223 123-4567",
			"reservas@playadorada.com", AveragePrice.$$$, null, null, null, null, HotelType.Hotel, null);

		userService.updateUserAccount("reservas@playadorada.com", dto, null, null);
		System.out.println("[PROFILE] Actualizado perfil de Hotel Playa Dorada");
	}

	private void updateCafeDelCentro() {
		Location location = new Location("Av. Santa Fe 1234, Buenos Aires", -34.5895, -58.3816);
		AttentionSchedule schedule = new AttentionSchedule(LocalTime.parse("07:00"), LocalTime.parse("20:00"));
		List<DayOfWeek> openingDays = List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
				DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY);

		AccountUpdateRequestDTO dto = new AccountUpdateRequestDTO("Café del Centro",
			"Un acogedor café en el corazón de la ciudad con especialidades artesanales", location,
			"+54 11 9876-5432", "contacto@cafedelcentro.com", AveragePrice.$, RestaurantType.Cafe, schedule,
			openingDays, null, null, null);

		userService.updateUserAccount("contacto@cafedelcentro.com", dto, null, null);
		System.out.println("[PROFILE] Actualizado perfil de Café del Centro");
	}

	private void updateHostelMontania() {
		Location location = new Location("Ruta 234, San Carlos de Bariloche", -41.1335, -71.3103);
		AccountUpdateRequestDTO dto = new AccountUpdateRequestDTO("Hostel Montaña Mágica",
			"Un hostel ecológico en las montañas con vistas panorámicas", location, "+54 294 123-4567",
			"info@hostelmontana.com", AveragePrice.$$, null, null, null, null, HotelType.Hostel, null);

		userService.updateUserAccount("info@hostelmontana.com", dto, null, null);
		System.out.println("[PROFILE] Actualizado perfil de Hostel Montaña Mágica");
	}

	private void updateBrisaMarina() {
		Location location = new Location("Av. Costanera 1234, Mar del Plata", -38.0176, -57.5367);
		AttentionSchedule schedule = new AttentionSchedule(LocalTime.parse("12:00"), LocalTime.parse("23:00"));
		List<DayOfWeek> openingDays = List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
				DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY);

		AccountUpdateRequestDTO dto = new AccountUpdateRequestDTO("Brisa Marina",
			"Experiencia gastronómica gourmet frente al mar donde cada plato cuenta una historia", location,
			"+54 223 412-3456", "contacto@brisamarina.com", AveragePrice.$$$, RestaurantType.Argentino, schedule,
			openingDays, null, null, null);

		userService.updateUserAccount("isabel@brisamarina.com", dto, null, null);
		System.out.println("[PROFILE] Actualizado perfil de Brisa Marina");
	}

	private void updateSaboresPeruanos() {
		Location location = new Location("Av. Cabildo 2345, CABA", -34.5607, -58.4566);
		AttentionSchedule schedule = new AttentionSchedule(LocalTime.parse("11:30"), LocalTime.parse("23:30"));
		List<DayOfWeek> openingDays = List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
				DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY);

		AccountUpdateRequestDTO dto = new AccountUpdateRequestDTO("Sabores Peruanos",
			"Auténtica cocina peruana con ingredientes frescos y sabores tradicionales", location,
			"+54 11 4783-2198", "reservas@saboresperuanos.com", AveragePrice.$$, RestaurantType.Peruano, schedule,
			openingDays, null, null, null);

		userService.updateUserAccount("gaston@saboresperuanos.com", dto, null, null);
		System.out.println("[PROFILE] Actualizado perfil de Sabores Peruanos");
	}

	private void updateElEncuentroHostel() {
		Location location = new Location("Av. San Martín 876, Bariloche", -41.1335, -71.3103);
		AccountUpdateRequestDTO dto = new AccountUpdateRequestDTO("El Encuentro Hostel",
			"Espacio para viajeros jóvenes que buscan conectar con otros aventureros", location,
			"+54 294 415-6789", "info@elencuentrohostel.com", AveragePrice.$, null, null, null, null,
			HotelType.Hostel, null);

		userService.updateUserAccount("diego@elencuentrohostel.com", dto, null, null);
		System.out.println("[PROFILE] Actualizado perfil de El Encuentro Hostel");
	}

	private void updateBusinessImages() {
		System.out.println("--- Actualizando imágenes de negocios ---");

		updateBusinessImagesForEmail("info@labuenamesa.com", "sample_images/profile_pictures/restaurant.jpg",
				List.of("sample_images/business_picture/restaurant2.jpg",
						"sample_images/business_picture/resto5.jpg"));

		updateBusinessImagesForEmail("reservas@playadorada.com", "sample_images/profile_pictures/hotel.jpg",
				List.of("sample_images/business_picture/playa1.jpeg",
						"sample_images/business_picture/hostel1.jpg",
						"sample_images/business_picture/hostel2.jpg"));

		updateBusinessImagesForEmail("contacto@cafedelcentro.com", "sample_images/profile_pictures/cafe.jpeg",
				List.of("sample_images/business_picture/cafe1.jpg",
						"sample_images/business_picture/cafe2.jpg"));

		updateBusinessImagesForEmail("info@hostelmontana.com", "sample_images/profile_pictures/hostel.jpg",
				List.of("sample_images/business_picture/hotel1.jpg"));

		updateBusinessImagesForEmail("isabel@brisamarina.com", "sample_images/profile_pictures/seafood.jpg",
				List.of("sample_images/business_picture/brisa1.jpeg",
						"sample_images/business_picture/brisa2.jpg"));

		updateBusinessImagesForEmail("gaston@saboresperuanos.com", "sample_images/profile_pictures/peru1.png",
				List.of("sample_images/business_picture/peru1.jpg"));

		updateBusinessImagesForEmail("diego@elencuentrohostel.com", "sample_images/profile_pictures/encuentro1.png",
				List.of("sample_images/business_picture/encuentro1.jpg"));
	}

	private void updateBusinessImagesForEmail(String email, String avatarPath, List<String> imagePaths) {
		MultipartFile avatar = loadImage(avatarPath);
		List<MultipartFile> files = imagePaths.stream().map(this::loadImage).filter(f -> f != null).toList();

		if (avatar == null && files.isEmpty()) {
			System.err.println("[BUSINESS IMAGES] No se encontraron imágenes para " + email);
			return;
		}

		AccountUpdateRequestDTO dto = new AccountUpdateRequestDTO(null, null, null, null, null, null, null, null, null,
				null, null, null);
		userService.updateUserAccount(email, dto, files.isEmpty() ? null : files, avatar);
		System.out.println("[BUSINESS IMAGES] Actualizadas imágenes de negocio para " + email);
	}

	private void seedReviews() {
		System.out.println("--- Creando reviews para algunas publicaciones ---");
		if (publicationIds.isEmpty()) {
			System.out.println("[REVIEWS] No hay publicaciones para reseñar");
			return;
		}

		String noReviewBusiness = "gaston@saboresperuanos.com";
		List<String> noReviewPubs = businessPublicationIds.get(noReviewBusiness);

		String[] allReviewers = { "camila@example.com", "luisito@example.com", "julian@example.com",
			"joseluis@example.com", "ricardo@example.com", "astrid@example.com", "aizen@example.com",
			"lucia@example.com", "pedro@example.com" };

		Random random = new Random();
		
		List<String> eligiblePublications = publicationIds.stream()
			.filter(pubId -> noReviewPubs == null || !noReviewPubs.contains(pubId))
			.toList();

		int maxPubs = Math.min(5, eligiblePublications.size());
		List<String> selectedPublications = new ArrayList<>();
		
		List<String> shuffled = new ArrayList<>(eligiblePublications);
		java.util.Collections.shuffle(shuffled, random);
		selectedPublications = shuffled.subList(0, maxPubs);

		for (String pubId : selectedPublications) {
			List<String> shuffledReviewers = new ArrayList<>(Arrays.asList(allReviewers));
			java.util.Collections.shuffle(shuffledReviewers, random);
			
			int numReviewsForThisPub = random.nextInt(3);
			
			for (int i = 0; i < numReviewsForThisPub && i < shuffledReviewers.size(); i++) {
				String email = shuffledReviewers.get(i);
				try {
					int reviewType = random.nextInt(5);
					String title = switch (reviewType) {
						case 0 -> "Excelente experiencia";
						case 1 -> "Muy recomendable";
						case 2 -> "Buena opción";
						case 3 -> "Podría mejorar";
						default -> "Podría mejorar";
					};
					String content = switch (reviewType) {
						case 0 -> "¡Todo estuvo increíble, volvería sin dudarlo!";
						case 1 -> "Muy buena relación calidad-precio y atención.";
						case 2 -> "La experiencia fue buena en general, algunos detalles a mejorar.";
						case 3 -> "Podría mejorar";
						default -> "No estuvo mal, pero esperaba un poco más en algunos aspectos.";
					};
					double rating = switch (reviewType) {
						case 0 -> 5.0;
						case 1 -> 4.0;
						case 2 -> 3.0;
						case 3 -> 2.0;
						default -> 1.0;
					};

					ReviewCreationRequestDTO dto = new ReviewCreationRequestDTO(title, content, rating);
					publicationService.createReview(dto, null, pubId, email);
					System.out.println("[REVIEW] " + email + " reseñó publicación " + pubId + " (" + title + ")");
				}
				catch (Exception e) {
					System.err.println("[REVIEW] Error creando review de " + email + " para pub " + pubId + ": "
							+ e.getMessage());
				}
			}
		}
	}

	private void seedLikes() {
		System.out.println("--- Creando likes en publicaciones ---");
		if (publicationIds.isEmpty()) {
			System.out.println("[LIKES] No hay publicaciones para likear");
			return;
		}

		// Usuarios que van a likear
		String[] likers = { "camila@example.com", "luisito@example.com", "julian@example.com",
				"joseluis@example.com", "ricardo@example.com", "astrid@example.com", "aizen@example.com",
				"lucia@example.com", "pedro@example.com" };

		// Negocio objetivo: La Buena Mesa debe sumar 9 likes entre todas sus publicaciones
		String targetBusiness = "info@labuenamesa.com";
		List<String> targetPubs = businessPublicationIds.get(targetBusiness);
		if (targetPubs != null && !targetPubs.isEmpty()) {
			int remaining = 9;
			outer: for (String pubId : targetPubs) {
				for (int i = 0; i < likers.length && remaining > 0; i++) {
					String email = likers[i];
					try {
						publicationService.addLike(pubId, email);
						remaining--;
						System.out.println("[LIKE] " + email + " dio like a publicación " + pubId
								+ " (negocio objetivo, total 9)");
					}
					catch (Exception e) {
						System.err.println("[LIKE] Error creando like de " + email + " para pub " + pubId
								+ " (negocio objetivo): " + e.getMessage());
					}
					if (remaining <= 0)
						break outer;
				}
			}
			System.out.println("[LIKES] Total de likes asignados al negocio " + targetBusiness + ": " + (9 - remaining));
		}
		else {
			System.out.println("[LIKES] No se encontraron publicaciones para el negocio objetivo " + targetBusiness);
		}

		// Para el resto de publicaciones (otros negocios), asignar algunos likes básicos
		for (String pubId : publicationIds) {
			// Saltar publicaciones del negocio objetivo
			if (targetPubs != null && targetPubs.contains(pubId))
				continue;
			for (int i = 0; i < 3 && i < likers.length; i++) {
				String email = likers[i];
				try {
					publicationService.addLike(pubId, email);
					System.out.println("[LIKE] " + email + " dio like a publicación " + pubId);
				}
				catch (Exception e) {
					System.err.println("[LIKE] Error creando like de " + email + " para pub " + pubId + ": "
							+ e.getMessage());
				}
			}
		}
	}

	private void seedFollows() {
		System.out.println("--- Creando relaciones de seguidos entre usuarios ---");
		try {
			String camilaId = getUserId("camila@example.com");
			String luisitoId = getUserId("luisito@example.com");
			String julianId = getUserId("julian@example.com");
			String joseluisId = getUserId("joseluis@example.com");

			// Camila sigue a Luisito y Julián
			follow("camila@example.com", luisitoId, "Camila -> Luisito");
			follow("camila@example.com", julianId, "Camila -> Julián");

			// Luisito sigue a Camila
			follow("luisito@example.com", camilaId, "Luisito -> Camila");

			// Julián sigue a Camila y Luisito
			follow("julian@example.com", camilaId, "Julián -> Camila");
			follow("julian@example.com", luisitoId, "Julián -> Luisito");

			// José Luis sigue a Camila y Julián
			follow("joseluis@example.com", camilaId, "José Luis -> Camila");
			follow("joseluis@example.com", julianId, "José Luis -> Julián");
		}
		catch (Exception e) {
			System.err.println("[FOLLOW] Error general creando seguidos: " + e.getMessage());
		}
	}

	private String getUserId(String email) {
		return userService.getUserAccount(email).id();
	}

	private void follow(String followerEmail, String followedUserId, String label) {
		try {
			userService.followUser(followerEmail, followedUserId);
			System.out.println("[FOLLOW] " + label);
		}
		catch (Exception e) {
			System.err.println("[FOLLOW] Error en " + label + ": " + e.getMessage());
		}
	}

	private MultipartFile loadImage(String pathStr) {
		try {
			Path path = Paths.get(pathStr);
			if (!Files.exists(path)) {
				return null;
			}

			byte[] bytes = Files.readAllBytes(path);
			String filename = path.getFileName().toString();
			String contentType = Files.probeContentType(path);
			if (contentType == null)
				contentType = "application/octet-stream";

			return new SimpleMultipartFile(filename, filename, contentType, bytes);
		}
		catch (IOException e) {
			System.err.println("[IMAGE] Error leyendo archivo " + pathStr + ": " + e.getMessage());
			return null;
		}
	}

	private static class SimpleMultipartFile implements MultipartFile {

		private final String name;
		private final String originalFilename;
		private final String contentType;
		private final byte[] content;

		SimpleMultipartFile(String name, String originalFilename, String contentType, byte[] content) {
			this.name = name;
			this.originalFilename = originalFilename;
			this.contentType = contentType;
			this.content = content;
		}

		@Override
		public String getName() {
			return name;
		}

		@Override
		public String getOriginalFilename() {
			return originalFilename;
		}

		@Override
		public String getContentType() {
			return contentType;
		}

		@Override
		public boolean isEmpty() {
			return content.length == 0;
		}

		@Override
		public long getSize() {
			return content.length;
		}

		@Override
		public byte[] getBytes() {
			return content;
		}

		@Override
		public InputStream getInputStream() {
			return new java.io.ByteArrayInputStream(content);
		}

		@Override
		public void transferTo(java.io.File dest) throws IOException, IllegalStateException {
			Files.write(dest.toPath(), content);
		}
	}

	public Map<String, String> getTokens() {
		return tokens;
	}

}
