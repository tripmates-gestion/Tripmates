export const ENDPOINTS = {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    USER_ME: '/users/me',

    MY_FOLLOWERS: '/users/me/followers',
    MY_FOLLOWINGS: '/users/me/followings',
    
    USER_FOLLOWERS: (userId: string) => `/users/${userId}/followers`,
    USER_FOLLOWINGS: (userId: string) => `/users/${userId}/followings`,
    FOLLOW_USER: (userId: string) => `/users/${userId}/follow`,
    UNFOLLOW_USER: (userId: string) => `/users/${userId}/unfollow`,

    REFRESH_TOKEN: '/auth/refresh',
    PUBLISH_BUSINESS: '/publications/business',
    GET_BUSINESS_PUBLICATIONS: '/publications/mine',
    PATCH_BUSINESS_PUBLICATION: '/publications/',
    DELETE_BUSINESS_PUBLICATION: '/publications/',
    HOTEL_ROOMPACK: '/users/me/hosting',
    RESTAURANT_MENU: '/users/me/restaurant',
    GET_OTHER_BUSINESS_PUBLICATIONS: '/publications/',
    SEARCH_BUSINESS: "/users/search/business",
    SEARCH_TRAVELERS: "/users/search/user",
    CREATE_PLAN: "/users/plans/create",
    GET_PLANS: "/users/plans/list",
    POST_REVIEW: "/publications/{id}/review",
    GET_PUBLICATION_REVIEWS: "/publications/{id}/review",
    GET_USER_REVIEWS: "/publications/users/{id}/reviews",
    DELETE_PLAN: "/users/plans/{id}",
    PATCH_PLAN: "/users/plans/{id}",
    GET_USER_BY_EMAIL: "/users/{email}",

    LIKE_PUBLICATION: "/publications/{id}/like",
    UNLIKE_PUBLICATION: "/publications/{id}/unlike",
    GET_LIKES_FOR_PUBLICATION: "/publications/{id}/likes",

    // recomendaciones
    BUSSINESS_PUBLICATION_RECOMMENDATIONS: '/users/recommendations/publications/',
  
    METRICS_REVIEWS: '/metrics/reviews',
    METRICS_PROFILE_VIEWS: '/metrics/profile-views',
    METRICS_LIKES: '/metrics/likes',
    METRICS_VIEW_PROFILE: '/metrics/view-profile'

    // invitaciones a planes 
};
  