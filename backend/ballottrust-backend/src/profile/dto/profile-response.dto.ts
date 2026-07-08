export class ProfileResponseDto {
  id!: string;

  fullName!: string;

  email!: string;

  role!: string;

  status!: string;

  avatarUrl?: string | null;

  profilePhoto?: string | null;

  bio?: string | null;

  phoneNumber?: string | null;

  dateOfBirth?: Date | null;

  gender?: string | null;

  department?: string | null;

  course?: string | null;

  year?: number | null;

  semester?: number | null;

  registrationNumber?: string | null;

  studentIdCard?: string | null;

  address?: string | null;

  city?: string | null;

  state?: string | null;

  country?: string | null;

  postalCode?: string | null;

  emailVerified!: boolean;

  provider!: string;

  profileCompleted!: boolean;

  lastLogin?: Date | null;

  createdAt!: Date;

  updatedAt!: Date;
}