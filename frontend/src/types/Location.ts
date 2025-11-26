export interface LocationDTO {
  address: string;
  latitude: number;
  longitude: number;
}

export interface BusinessAccountDTO {
  id: string;
  name: string;
  description?: string;
  location: LocationDTO;
}
