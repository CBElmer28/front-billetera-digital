export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
}

export interface TokenPayload {
  sub: string;
  exp: number;
}