// src/mocks/veganRestaurantMock.ts

import type { BusinessPubAccountDataDTO } from "../../types/AccountData";
import type { BusinessPublicationResponseDTO } from "../../types/business";

// ──────────────────────────────────────────────
// Constantes de imágenes y datos de contacto
// ──────────────────────────────────────────────
const VEGAN_RESTAURANT_AVATAR =
  "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764";
const VEGAN_RESTAURANT_BANNER =
  "https://images.unsplash.com/photo-1581894408375-cc0738fef8b4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171";

const VEGAN_MENU_IMAGES = [
  "https://plus.unsplash.com/premium_photo-1698867577020-38ae235fd612?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880",
  "https://plus.unsplash.com/premium_photo-1664648005432-035f0c45fc6e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
  "https://images.unsplash.com/photo-1600850056064-a8b380df8395?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
];

const VEGAN_PUB_IMAGES = [
    "https://images.unsplash.com/photo-1504718855392-c0f33b372e72?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
  "https://plus.unsplash.com/premium_photo-1664648005718-91b617643af5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
  "https://plus.unsplash.com/premium_photo-1674106347908-4e8e7f3e001f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
];

// ──────────────────────────────────────────────
// Constantes generales del negocio
// ──────────────────────────────────────────────
const PRIVATE_VEGAN_MAIL_MOCK = "private@verdevida.com";
const PUBLIC_VEGAN_MAIL_MOCK = "contacto@verdevida.com";
const BUSINESS_VEGAN_ROLE_MOCK = "BUSINESS" as const;
const BUSINESS_PHONENUMBER_MOCK = "11-6543-9876";

// ──────────────────────────────────────────────
// Mock principal del restaurante vegano
// ──────────────────────────────────────────────
export const VEGAN_RESTAURANT: BusinessPubAccountDataDTO = {
  id: "1003",
  avatarURL: VEGAN_RESTAURANT_AVATAR,
  name: "Verde Vida Café (mockito)",
  email: PRIVATE_VEGAN_MAIL_MOCK,
  role: BUSINESS_VEGAN_ROLE_MOCK,
  description:
    "Restaurante vegano con ingredientes orgánicos y locales. Nuestra misión es ofrecer comidas saludables sin sacrificar sabor ni creatividad.",
  location: "Palermo, Buenos Aires, Argentina",
  phoneNumber: BUSINESS_PHONENUMBER_MOCK,
  publicEmail: PUBLIC_VEGAN_MAIL_MOCK,
  profileImageUrls: [VEGAN_RESTAURANT_BANNER, ...VEGAN_MENU_IMAGES],
  businessType: "RESTAURANT",
  averagePrice: "$$",
  restaurantType: "vegano",
  attentionSchedule: {
    openingTime: "09:00",
    closingTime: "23:00",
  },
  openingDays: [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ],
  menu: [
    {
      foodName: "Bowl de Quinoa y Vegetales",
      price: 8.5,
      description:
        "Quinoa orgánica, mix de vegetales salteados, palta y aderezo de tahini.",
      photosURLs: [VEGAN_MENU_IMAGES[0]],
    },
    {
      foodName: "Hamburguesa de Garbanzos",
      price: 10.0,
      description:
        "Hamburguesa casera de garbanzos con pan integral, lechuga, tomate y mayonesa vegana.",
      photosURLs: [VEGAN_MENU_IMAGES[1]],
    },
    {
      foodName: "Smoothie Verde Detox",
      price: 6.5,
      description:
        "Licuo de espinaca, manzana verde, jengibre y limón. Refrescante y natural.",
      photosURLs: [VEGAN_MENU_IMAGES[2]],
    },
  ],
  hotelType: null,
  roomPacks: null,
};

// ──────────────────────────────────────────────
// Publicaciones del restaurante vegano
// ──────────────────────────────────────────────
export const VEGAN_RESTAURANT_PUBLICATIONS: BusinessPublicationResponseDTO[] = [
  {
    id: "1006",
    title: "Noche Vegana Gourmet",
    description:
      "Vení a disfrutar una cena especial con menú degustación vegano de tres pasos. ¡Platos de estación y sabores únicos!",
    openingDays: ["FRIDAY", "SATURDAY"],
    attentionSchedule: {
      openingTime: "19:00",
      closingTime: "23:00",
    },
    exceptionalClosingDays: [],
    phoneNumber: BUSINESS_PHONENUMBER_MOCK,
    email: PUBLIC_VEGAN_MAIL_MOCK,
    location: "Palermo, Buenos Aires",
    imageUrls: [VEGAN_PUB_IMAGES[0]],
    ownerId: "1003",
    ownerUsername: "verdevida_admin",
    ownerAvatarUrl: VEGAN_RESTAURANT_AVATAR,
    createdAt: "2024-11-01T20:00:00Z",
    tags: ["evento", "degustación", "vegano", "gastronomía"],
  },
  {
    id: "1007",
    title: "Taller de Cocina Vegana",
    description:
      "Aprendé a preparar recetas saludables con ingredientes naturales. Cupos limitados, inscribite ahora.",
    openingDays: ["SUNDAY"],
    attentionSchedule: {
      openingTime: "10:00",
      closingTime: "14:00",
    },
    exceptionalClosingDays: [],
    phoneNumber: BUSINESS_PHONENUMBER_MOCK,
    email: PUBLIC_VEGAN_MAIL_MOCK,
    location: "Palermo, Buenos Aires",
    imageUrls: [VEGAN_PUB_IMAGES[1]],
    ownerId: "1003",
    ownerUsername: "verdevida_admin",
    ownerAvatarUrl: VEGAN_RESTAURANT_AVATAR,
    createdAt: "2024-10-20T14:00:00Z",
    tags: ["taller", "aprendizaje", "cocina", "vegano"],
  },
];
