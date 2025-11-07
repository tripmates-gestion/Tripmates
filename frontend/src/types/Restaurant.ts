export type RestaurantType = 'Cafe'|'Vegano'|'Vegetariano'|'Peruano' |'Argentino' | 'Italiano'

export type MenuItem = {
    photosURLs: string[];
    foodName: string;
    price: number;
    description: string;
}