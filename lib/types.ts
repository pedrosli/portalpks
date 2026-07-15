export type Role = "admin" | "broker";

export type PropertyStatus = "available" | "rented";

export interface Profile {
  id: string;
  role: Role;
  name: string | null;
  email: string | null;
  created_at: string;
}

export interface PropertyPhoto {
  id: string;
  property_id: string;
  path: string;
  position: number;
  created_at: string;
  /** Preenchida em runtime a partir de uma signed URL do Storage. */
  signedUrl?: string;
}

export interface Property {
  id: string;
  title: string;
  neighborhood: string | null;
  price: number | null;
  area_m2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  furnished: boolean;
  condo_fee: number | null;
  iptu: number | null;
  floor: string | null;
  pets_allowed: boolean;
  available_from: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  description: string | null;
  status: PropertyStatus;
  cover_photo_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyWithPhotos extends Property {
  property_photos: PropertyPhoto[];
}
