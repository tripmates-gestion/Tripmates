export type RestaurantType = 'cafe'|'vegano'|'vegetariano'|'peruano' |'argento' | 'italiano'
export type MenuItem = {
    photosURLs: string[];
    foodName: string;
    price: number;
    description: string;
}