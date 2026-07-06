export interface ForgotPasswordRequest {

  email: string;

}

export interface ResetPasswordRequest {

  token: string;

  password: string;

}

export interface PasswordResponse {

  success: boolean;

  message: string;

}