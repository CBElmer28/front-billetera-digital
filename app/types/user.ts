export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  dni?: string; // Nuevo campo opcional (por si acaso)
  avatar?: string; // Lo vi en tu Sidebar, agreguémoslo para que no chille
  age?: number;    // También estaba en tu Sidebar
}

export interface TokenPayload {
  sub: string;
  exp: number;
  name?: string; // El token ahora trae el nombre
}