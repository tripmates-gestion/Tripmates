//TODO: Verificar los endpoints
export const ENDPOINTS = {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    USER_ME: '/users/me',    
    REFRESH_TOKEN: '/auth/refresh',
    PUBLISH_BUSINESS: '/publications/business',
    GET_BUSINESS_PUBLICATIONS: '/publications/mine',
    PATCH_BUSINESS_PUBLICATION: '/publications/',
    DELETE_BUSINESS_PUBLICATION: '/publications/',
    GET_OTHER_BUSINESS_PUBLICATIONS: '/publications/',
    SEARCH_BUSINESS: "/users/search/business",
    POST_REVIEW: "/publications/{id}/review",
    GET_PUBLICATION_REVIEWS: "/publications/{id}/review",
    GET_USER_REVIEWS: "/publications/users/{id}/reviews",
  };
  