export interface LocationDTO {
  address: string;
  latitude: number;
  longitude: number;
}

export const DEFAULT_LOCATION: LocationDTO = {
  address: "",
  latitude: -34.6037,
  longitude: -58.3816,
};

export interface BusinessAccountDTO {
  id: string;
  name: string;
  description?: string;
  location: LocationDTO;
}
