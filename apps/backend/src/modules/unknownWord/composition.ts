import { RedisStoryCache } from "@/cache/redisStoryCache";
import { UnknownWordController } from "./unknownWordController";
import { UnknownWordRepository } from "./unknownWordRepository";
import { UnknownWordService } from "./unknownWordService";
import { prisma } from "@/services/prisma";
import redisClient from "@/services/redis";

// Repositories
const unknownWordRepository = new UnknownWordRepository(prisma);
const redisStoryCache = new RedisStoryCache(redisClient);

// Business logic
export const unknownWordService = new UnknownWordService(unknownWordRepository, redisStoryCache);

// Controller
export const unknownWordController = new UnknownWordController(unknownWordService);
