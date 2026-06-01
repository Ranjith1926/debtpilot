export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  firebaseToken?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface FirebaseAuthInput {
  idToken: string;
  deviceToken?: string;
  platform?: string;
}
