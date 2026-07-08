import {
  IsEmail,
  IsEnum,
  IsString,
} from 'class-validator';

export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  VOTER = 'VOTER',
}

export class RegisterDto {
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}