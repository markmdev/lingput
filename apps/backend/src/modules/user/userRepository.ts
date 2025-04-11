import { prisma } from "@/services/prisma";

export class UserRepository {
  async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async createUser(email: string, hashedPassword: string) {
    return prisma.user.create({ data: { email, password: hashedPassword } });
  }
}
