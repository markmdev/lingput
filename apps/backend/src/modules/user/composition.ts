import { prisma } from "@/services/prisma";
import { UserRepository } from "./userRepository";

export const userRepository = new UserRepository(prisma);
