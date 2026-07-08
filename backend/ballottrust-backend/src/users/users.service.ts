import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getPendingUsers() {
    return this.prisma.user.findMany({
      where: {
        status: 'PENDING',
      },
    });
  }

  async approveUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
    });
  }

  async rejectUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
    });
  }


async createStaff(
  data: CreateStaffDto,
) {
  const existingUser =
    await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

  if (existingUser) {
    throw new Error(
      'Email already exists',
    );
  }

  const hashedPassword =
    await argon2.hash(
      data.password,
    );

  return this.prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,

      role: data.role,

      status: 'APPROVED',
    },
  });
}


}