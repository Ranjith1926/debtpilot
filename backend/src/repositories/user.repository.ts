import prisma from '@/lib/prisma';
import type { User, Prisma } from '@prisma/client';

export class UserRepository {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { phone } });
  }

  async findByFirebaseUid(uid: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { firebaseUid: uid } });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<User> {
    return prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  async upsertByFirebaseUid(uid: string, data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.upsert({
      where: { firebaseUid: uid },
      create: data,
      update: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
    });
  }
}

export const userRepository = new UserRepository();
