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
    SEARCH_BUSINESS: "/users/search/business",
    GET_USER_PLANS: "users/plans",
    POST_REVIEW: '/reviews/publication/{id}',
    GET_PUBLICATION_REVIEWS: '/reviews/publication/{id}',
    GET_USER_REVIEWS: '/reviews/user/{id}',
    CREATE_PLAN: "/users/plans/create",
    GET_PLANS: "/users/plans/list",
  };
  