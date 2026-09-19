import { IsEmail, IsEnum, IsString } from 'class-validator';

export enum StaffRole {
  ELECTION_COMMISSIONER = 'ELECTION_COMMISSIONER',
  AUDITOR = 'AUDITOR',
}

export class CreateStaffDto {
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsEnum(StaffRole)
  role!: StaffRole;
}
