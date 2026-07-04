export interface Profile {
  id: string;

  fullName: string;

  email: string;

  role: string;

  status: string;

  avatarUrl?: string;

  bio?: string;

  phoneNumber?: string;

  department?: string;

  course?: string;

  year?: number;

  semester?: number;

  registrationNumber?: string;

  address?: string;

  city?: string;

  state?: string;

  country?: string;

  postalCode?: string;

  emailVerified: boolean;

  provider: string;

  profileCompleted: boolean;

  lastLogin?: string | null;
}