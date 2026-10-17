import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateStaffDto } from './dto/create-staff.dto';

/**
 * Every method here is reachable by SUPER_ADMIN/ELECTION_COMMISSIONER and
 * returns full user rows straight from Prisma unless scoped by this select,
 * which would otherwise hand back the argon2 password hash (and the MFA/OTP/
 * reset-token secrets) to any caller approving, rejecting or creating a
 * user — the same leak the bootstrap-admin endpoint was fixed to avoid.
 */
const SAFE_USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  status: true,
  department: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getPendingUsers() {
    return this.prisma.user.findMany({
      where: {
        status: 'PENDING',
      },
      select: SAFE_USER_SELECT,
    });
  }

  async approveUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
      select: SAFE_USER_SELECT,
    });
  }

  async rejectUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
      select: SAFE_USER_SELECT,
    });
  }

  async createStaff(data: CreateStaffDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await argon2.hash(data.password);

    return this.prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,

        role: data.role,

        status: 'APPROVED',
      },
      select: SAFE_USER_SELECT,
    });
  }
}
