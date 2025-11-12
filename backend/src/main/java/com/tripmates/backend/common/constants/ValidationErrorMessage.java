package com.tripmates.backend.common.constants;

public class ValidationErrorMessage {

	public static final String USER_ALREADY_EXISTS = "El usuario ya existe";

	public static final String USER_NOT_FOUND = "El usuario no existe";

	public static final String INVALID_CREDENTIALS = "Credenciales invalidas";

	public static final String INVALID_REFRESH_TOKEN = "Token invalido";

	public static final String INVALID_ACCESS_TOKEN = "Token invalido";

	public static final String EMPTY_OR_NULL_FIELD = "El campo no debe estar vacio: ";

	public static final String INVALID_EMAIL = "El email del usuario no es valido.";

	public static final String FILD_NO_ALLOWED = "El campo no está permitido: ";

	public static final String NOT_BUSINESS_ACCOUNT = "La cuenta debe ser de tipo negocio";

	public static final String NOT_RESTAURANT_ACCOUNT = "La cuenta debe ser de tipo restaurante";

	public static final String NOT_HOTEL_ACCOUNT = "La cuenta debe ser de tipo hotel";

	public static final String NOT_VALID_DAY = "Se debe proporcionar días válidos (en mayúsculas)";

	public static final String INVALID_LIST_ELEMENTS = "Se debe proporcionar una lista de elementos válidos";

	public static final String NOT_FOUND_IMAGE_URL = "No se encontró la imagen referida.";

	public static final String REVIEW_TITLE_BLANK = "El titulo de la reseña no puede estar en blanco";

	public static final String REVIEW_CONTENT_BLANK = "El contenido de la reseña no puede estar en blanco";

	public static final String REVIEW_RATING_MIN = "La calificacion de la reseña debe ser mayor o igual 0.5";

	public static final String REVIEW_RATING_MAX = "La calificacion de la reseña debe ser menor o igual a 5.0";

	public static final String REVIEW_PUBLICAITON_ID_BLANK = "El id de la publicacion referida en la reseña debe ser provista";

	public static final String REVIEW_PUBLICAITON_ID_NOT_FOUND = "La publicacion referida en la reseña no existe";

	public static final String UNAUTHORIZED = "No tienes permiso para realizar esta accion";

	public static final String IMAGE_FILES_BLANK = "Se proporcionó un archivo de imagen vacío o una lista vacía de archivos de imagen.";

	public static final String PUBLICATION_NOT_FOUND = "La publicacion no se encontró";

	public static final String INDEX_OUT_OF_RANGE = "Indice fuera de ranfo";

	public static final String NOTHING_TO_UPDATE = "No existe una entidad para actualizar";

	public static final String NOTHING_TO_DELETE = "No existe una entidad para eliminar";

	public static final String CANNOT_FOLLOW_UNFOLLOW_YOURSELF = "No puedes dejar de seguirte/seguirte a ti mismo";

	public static final String CANNOT_FOLLOW_UNFOLLOW_BUSINESS = "No puedes seguir/dejar de seguir a un cuenta de negocio";

	public static final String CANNOT_UNFOLLOW_SOMEONE_YOU_ARE_NOT_FOLLOWING = "No puedes dejar de seguir a alguien que no sigues";

	public static final String CANNOT_FOLLOW_SOMEONE_YOU_ARE_ALREADY_FOLLOWING = "No puedes seguir a alguien que ya sigues";

}
