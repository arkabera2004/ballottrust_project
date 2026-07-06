export interface LoginRequest {

  email: string;

  password: string;

}

export interface RegisterRequest {

  fullName: string;

  email: string;

  password: string;

  role: 'VOTER' | 'CANDIDATE';

}

export interface User {

  id: string;

  fullName: string;

  email: string;

  role: string;

  status: string;

}

export interface LoginResponse {

  access_token: string;

  refresh_token: string;

  user: User;

}

export interface RegisterResponse {

  success: boolean;

  message: string;

  userId: string;

}