import { DEFAULT_AVATAR_URL } from "../../constants/DefaultImages";
import type { BusinessPubAccountDataDTO } from "../../types/AccountData";
import type { BusinessPublicationResponseDTO } from "../../types/business";
import { VEGAN_RESTAURANT, VEGAN_RESTAURANT_PUBLICATIONS } from "./veganRestaurantMock";


const PRIVATE_HOTEL_MAIL_MOCK = "private@hotel.com"
const PUBLIC_HOTEL_MAIL_MOCK = "public@hotel.com"
const BUSINESS_HOTEL_ROLE_MOCK = "BUSINESS" as const;
const BUSINESS_PHONENUMBER_MOCK = "11-1234-5678";
const BARILOCHE_IMAGES = ["https://images.unsplash.com/photo-1598162480222-b2c3d92548d5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  "https://images.unsplash.com/photo-1702263525855-385a520842cf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1332",
  "https://images.unsplash.com/photo-1536099876051-79f4cbffeed1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
]

const CENTRAL_IMAGES = ["https://plus.unsplash.com/premium_photo-1669261881284-61bc3d7a8c17?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  "https://plus.unsplash.com/premium_photo-1669261883234-b17b982601f2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687"
]
//mock restaurant constnats
const PUBLIC_RESTAURANT_MAIL_MOCK = "public@restaurant.com"
const PRIVATE_RESTAURANT_MAIL_MOCK = "private@restaurant.com"
const BUSINESS_RESTAURANT_ROLE_MOCK = "BUSINESS" as const;



//NOTA CUANDO LO DEL BACK ESTÉ VOY A TENER QUE MANEJAR EL HECHO DE QUE PROBABLEMENTE HAYAN CAMPOS QUE ME DEVUELVAN A NULL
export const MOCK_BUSINESS_SEARCH_RESULTS: BusinessPubAccountDataDTO[] = [
  // ──────────────────────── HOTELES ────────────────────────
  {
    id: "1",
    avatarURL: DEFAULT_AVATAR_URL,
    name: "Hotel Bariloche Lake",
    email: PRIVATE_HOTEL_MAIL_MOCK,
    role: BUSINESS_HOTEL_ROLE_MOCK,
    description: "Hotel de lujo en Bariloche, vení con tu familia para experimentar la naturaleza de ARgentina!",
    location: "San Carlos de Bariloche, Argentina",
    phoneNumber: BUSINESS_PHONENUMBER_MOCK,
    publicEmail: PUBLIC_HOTEL_MAIL_MOCK,
    profileImageUrls: BARILOCHE_IMAGES,
    businessType: "HOSTING",
    averagePrice: "$$",

    // nulls de restaurant
    restaurantType: null,
    attentionSchedule: null,
    openingDays: null,
    menu: null,
    
    // campos solo de hotel
    hotelType: "hotel",
    roomPacks: [
      {
        checkInDate: "2025-12-01",
        checkOutDate: "2025-12-05",
        numberOfGuests: 2,
        services: ["Desayuno incluido", "Wi-Fi", "Pileta climatizada"],
        price: 420.0,
        description: "Suite con vista al lago y balcón privado",
        photosURLs: [
          "https://images.unsplash.com/photo-1727694739145-ae58a7f1c4ca?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1169",
        ],
      },
      {
        checkInDate: "2025-12-01",
        checkOutDate: "2025-12-05",
        numberOfGuests: 3,
        services: ["Desayuno incluido", "Almuerzo incluido", "Wi-Fi", "Sauna"],
        price: 750.0,
        description: "Suite presidencial",
        photosURLs: [
          "https://images.unsplash.com/photo-1565623833408-d77e39b88af6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1332",
        ],
      }
    ],
  },
  {
    id: "2",
    avatarURL: DEFAULT_AVATAR_URL,
    name: "Central",
    email: PRIVATE_RESTAURANT_MAIL_MOCK,
    role: BUSINESS_RESTAURANT_ROLE_MOCK,
    description: "Hotel de lujo en Bariloche, vení con tu familia para experimentar la naturaleza de ARgentina!",
    location: "San Borja, Lima, Perú",
    phoneNumber: BUSINESS_PHONENUMBER_MOCK,
    publicEmail: PUBLIC_RESTAURANT_MAIL_MOCK,
    profileImageUrls: CENTRAL_IMAGES,
    businessType: "RESTAURANT",
    averagePrice: "$$$",
    restaurantType: "peruano",
    attentionSchedule: {
      openingTime: "09:00",
      closingTime: "18:00",
    },
    openingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
    menu: [
      {
        foodName: "Ceviche",
        price: 10.0,
        description: "Ceviche de pescado fresco",
        photosURLs: [
          "https://images.unsplash.com/photo-1626663011519-b42e5ee10056?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
        ],
      },
      {
        foodName: "Lomo saltado",
        price: 15.0,
        description: "Lomo saltado de carne de res",
        photosURLs: [
          "https://plus.unsplash.com/premium_photo-1669261881284-61bc3d7a8c17?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
        ],
      },
      {
        foodName: "Pollo a la brasa",
        price: 10.0,
        description: "Pollo a la brasa peruano con especias exóticas",
        photosURLs: [
          "https://plus.unsplash.com/premium_photo-1669245207961-0281fd9396eb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
        ],
      },
    ],
    hotelType: null,
    roomPacks: null
  },

];
MOCK_BUSINESS_SEARCH_RESULTS.push(VEGAN_RESTAURANT);


export const MOCK_BUSINESS_PUBLICATIONS: Map<string, BusinessPublicationResponseDTO[]> = new Map<string, BusinessPublicationResponseDTO[]>([
  ["1", [
    {
      id: '1',
      title: 'Oferta Especial de Verano',
      description: 'Disfruta de un 20% de descuento en todas nuestras habitaciones durante el mes de enero.',
      openingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      attentionSchedule: {
        openingTime: '09:00',
        closingTime: '18:00'
      },
      exceptionalClosingDays: ['2025-01-01', '2025-12-25'],
      phoneNumber: '+549123456789',
      email: 'contacto@hotel.com',
      location: 'Av. Principal 1234, Ciudad',
      imageUrls: [
        'https://images.unsplash.com/photo-1620127332082-bae901d0ad76?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
        'https://images.unsplash.com/photo-1723709627483-5ba1666615cc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687'
      ],
      ownerId: 'owner1',
      ownerUsername: 'hotelboutique',
      ownerAvatarUrl: 'https://source.unsplash.com/random/200x200/?hotel',
      createdAt: '2024-11-01T10:00:00Z',
      tags: ['hotel', 'ofertas', 'verano']
    },
    {
      id: '2',
      title: 'Paquete Romántico',
      description: 'Incluye una noche en suite con jacuzzi, cena romántica y desayuno en la habitación.',
      openingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
      attentionSchedule: {
        openingTime: '14:00',
        closingTime: '12:00'
      },
      exceptionalClosingDays: [],
      phoneNumber: '+549123456789',
      email: 'reservas@hotel.com',
      location: 'Calle Romántica 456, Ciudad',
      imageUrls: [
        'https://plus.unsplash.com/premium_photo-1682800179949-5eec7a950b96?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
        'https://images.unsplash.com/photo-1560498965-2862eecaa1c8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=773'
      ],
      ownerId: 'owner1',
      ownerUsername: 'hotelboutique',
      ownerAvatarUrl: 'https://source.unsplash.com/random/200x200/?hotel',
      createdAt: '2024-10-25T15:30:00Z',
      tags: ['romantico', 'paquete', 'especial']
    }
  ]], 
  ["2", [
    {
      id: "3",
      title: "Menú Degustación Peruano",
      description: "Vení a disfrutar de una experiencia gastronómica única con los platos más emblemáticos del Perú: ceviche, lomo saltado y ají de gallina, preparados por nuestro chef principal.",
      openingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
      attentionSchedule: {
        openingTime: "12:00",
        closingTime: "23:00"
      },
      exceptionalClosingDays: ["2025-12-25"],
      phoneNumber: "11-1234-5678",
      email: "reservas@restaurant.com",
      location: "Av. Primavera 123, San Borja, Lima, Perú",
      imageUrls: [
        "https://images.unsplash.com/photo-1518963166898-a2590c9f64db?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
      ],
      ownerId: "owner2",
      ownerUsername: "centralresto",
      ownerAvatarUrl: "https://source.unsplash.com/random/200x200/?chef",
      createdAt: "2024-11-01T18:30:00Z",
      tags: ["degustación", "gastronomía", "peruano", "chef"]
    },
    {
      id: "4",
      title: "Almuerzo Ejecutivo",
      description: "De lunes a viernes, ofrecemos un menú ejecutivo que incluye entrada, plato principal y bebida, ideal para quienes buscan un almuerzo rápido pero sabroso.",
      openingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      attentionSchedule: {
        openingTime: "12:00",
        closingTime: "16:00"
      },
      exceptionalClosingDays: [],
      phoneNumber: "11-1234-5678",
      email: "contacto@restaurant.com",
      location: "Av. Primavera 123, San Borja, Lima, Perú",
      imageUrls: [
        "https://plus.unsplash.com/premium_photo-1661718977247-f8b63cedc622?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
      ],
      ownerId: "owner2",
      ownerUsername: "centralresto",
      ownerAvatarUrl: "https://source.unsplash.com/random/200x200/?restaurant",
      createdAt: "2024-10-20T13:00:00Z",
      tags: ["almuerzo", "menu", "ejecutivo", "oferta"]
    },
    {
      id: "5",
      title: "Noche Criolla en Central",
      description: "Este sábado te esperamos con música criolla en vivo y una selección especial de platos típicos peruanos. Un ambiente cálido y auténtico para disfrutar con amigos.",
      openingDays: ["SATURDAY"],
      attentionSchedule: {
        openingTime: "19:00",
        closingTime: "02:00"
      },
      exceptionalClosingDays: [],
      phoneNumber: "11-1234-5678",
      email: "eventos@restaurant.com",
      location: "Av. Primavera 123, San Borja, Lima, Perú",
      imageUrls: [
        "https://plus.unsplash.com/premium_photo-1661317271682-57f7a1c0e533?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
      ],
      ownerId: "owner2",
      ownerUsername: "centralresto",
      ownerAvatarUrl: "https://source.unsplash.com/random/200x200/?music,chef",
      createdAt: "2024-09-30T22:00:00Z",
      tags: ["evento", "música", "criollo", "noche"]
    }
  ]]  
]);
MOCK_BUSINESS_PUBLICATIONS.set(VEGAN_RESTAURANT.id, VEGAN_RESTAURANT_PUBLICATIONS);

  