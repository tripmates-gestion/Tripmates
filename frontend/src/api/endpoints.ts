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
    GET_PLANS: "/community/list-plans",
    POST_REVIEW: "/publications/{id}/review",
    GET_PUBLICATION_REVIEWS: "/publications/{id}/review",
    GET_USER_REVIEWS: "/publications/users/{id}/reviews",
    DELETE_PLAN: "/users/plans/{id}",
    PATCH_PLAN: "/community/plans/{id}", // Se cambia users a community
    GET_USER_BY_EMAIL: "/users/{email}",
    GET_USER_BY_ID: "/users/view/{id}",

    LIKE_PUBLICATION: "/publications/{id}/like",
    UNLIKE_PUBLICATION: "/publications/{id}/unlike",
    GET_LIKES_FOR_PUBLICATION: "/publications/{id}/likes",

    // recomendaciones
    BUSSINESS_PUBLICATION_RECOMMENDATIONS: '/users/recommendations/publications/',
    USER_RECOMMENDATIONS: '/users/recommendations/user/',
    BUSINESS_ACCOUNT_RECOMMENDATIONS: '/users/recommendations/business/',

    METRICS_REVIEWS: '/metrics/reviews',
    METRICS_PROFILE_VIEWS: '/metrics/profile-views',
    METRICS_LIKES: '/metrics/likes',
    METRICS_VIEW_PROFILE: '/metrics/view-profile',

    // invitaciones a planes
    COMMUNITY_PLAN: (planId: string) => `/community/plan/${planId}`,
    INVITE_USER_TO_PLAN: (planId: string, userId: string) => `/community/${planId}/${userId}/invite-user`,
    DECLINE_INVITATION: (planId: string) => `/community/${planId}/decline-invitation`,
    ACCEPT_INVITATION: (planId: string) => `/community/${planId}/accept-invitation`,

    // historial
    GET_HISTORY_LIKED: '/users/history/likes/',

    BUSINESS_BENCHMARKS: '/benchmarks/mine',
    GET_PUBLIC_BENCHMARKS: '/benchmarks/user/',
};
