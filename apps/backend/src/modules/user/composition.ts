import { UserRepository } from "./userRepository";
import { PrismaClient } from "@prisma/client";

export function createUserModule(deps: { prisma: PrismaClient }) {
  const repository = new UserRepository(deps.prisma);
  return { repository };
}
