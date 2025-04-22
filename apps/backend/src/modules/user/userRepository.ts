import { PrismaClient } from "@prisma/client";

export class UserRepository {
  constructor(private prisma: PrismaClient) {}
  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(email: string, hashedPassword: string) {
    return this.prisma.user.create({ data: { email, password: hashedPassword } });
  }
}
