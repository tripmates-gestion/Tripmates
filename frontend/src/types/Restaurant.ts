export type RestaurantType = 'Cafe'|'Vegano'|'Vegetariano'|'Peruano' |'Argento' | 'Italiano'

export type MenuItem = {
    photosURLs: string[];
    foodName: string;
    price: number;
    description: string;
}