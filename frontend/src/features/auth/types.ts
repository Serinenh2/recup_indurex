import type { JWTResponse } from '../../types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse extends JWTResponse {
  user: import('../../types').User;
}
