import { Base64 } from "@/types/types";
import { CreateStoryDTO, StoryWithUnknownWords } from "./story.types";
import { PrismaClient, Story } from "@prisma/client";
import { StorageError } from "@/errors/StorageError";
import { NotFoundError } from "@/errors/NotFoundError";
import { PrismaError } from "@/errors/PrismaError";
import { SupabaseClient } from "@supabase/supabase-js";
import { AppRedisClient } from "@/services/redis";
import { logger } from "@/utils/logger";
function getRandomFileName(extension: string) {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
}

function base64ToArrayBuffer(base64: Base64) {
  const binary = Buffer.from(base64, "base64");
  return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength);
}

export class StoryRepository {
  constructor(
    private prisma: PrismaClient,
    private storageClient: SupabaseClient,
    private redis: AppRedisClient
  ) {}

  private parseRedisStory(storyString: string): Story {
    const storyJson = JSON.parse(storyString);
    return {
      id: Number(storyJson.id),
      storyText: storyJson.storyText,
      translationText: storyJson.translationText,
      audioUrl: storyJson.audioUrl,
      userId: Number(storyJson.userId),
    };
  }

  async getAllStories(userId: number): Promise<Story[]> {
    try {
      const cacheKey = `stories:${userId}`;
      const cachedStories = await this.redis.lRange(cacheKey, 0, -1);
      if (cachedStories.length > 0) {
        logger.info("Cache hit for stories");
        return cachedStories.map((item) => this.parseRedisStory(item));
      }

      logger.info("Cache miss for stories");

      const stories = await this.prisma.story.findMany({
        where: {
          userId,
        },
        include: {
          unknownWords: true,
        },
      });

      await this.redis.lPush(
        cacheKey,
        stories.map((item) => JSON.stringify(item))
      );

      return stories;
    } catch (error) {
      throw new PrismaError("Unable to get all stories", error, { userId });
    }
  }

  async saveStoryToDB(story: CreateStoryDTO): Promise<Story> {
    try {
      const savedStory = await this.prisma.story.create({
        data: story,
      });
      return savedStory;
    } catch (error) {
      throw new PrismaError("Unable to save story to DB", error, { story });
    }
  }

  // save story audio to storage (.mp3)
  async saveStoryAudioToStorage(story: Base64): Promise<string> {
    const fileName = getRandomFileName("mp3");
    // story to ArrayBuffer
    const arrayBuffer = base64ToArrayBuffer(story);
    const { data, error } = await this.storageClient.storage
      .from("stories")
      .upload(fileName, arrayBuffer, {
        contentType: "audio/mpeg",
      });

    if (error) {
      throw new StorageError("Unable to save story audio to storage", error, { fileName });
    }
    if (!data) {
      throw new StorageError("Unable to save story audio to storage", error, { fileName });
    }

    return data.path;
  }

  async getSignedStoryAudioUrl(audioPath: string, storyId: number): Promise<string> {
    const { data, error } = await this.storageClient.storage
      .from("stories")
      .createSignedUrl(audioPath, 60 * 60);
    if (error) {
      throw new StorageError("Unable to get story audio", error, { storyId, audioPath });
    }
    if (!data) {
      throw new NotFoundError("Story audio", null, { storyId, audioPath });
    }
    return data.signedUrl;
  }

  async getStoryById(storyId: number): Promise<Story> {
    const story = await this.prisma.story.findUnique({
      where: {
        id: storyId,
      },
      include: {
        unknownWords: true,
      },
    });
    if (!story) {
      throw new NotFoundError("Story", null, { storyId });
    }
    return story;
  }

  async connectUnknownWords(
    storyId: number,
    wordIds: { id: number }[]
  ): Promise<StoryWithUnknownWords> {
    try {
      const response = await this.prisma.story.update({
        where: { id: storyId },
        data: {
          unknownWords: {
            connect: wordIds,
          },
        },
        include: {
          unknownWords: true,
        },
      });
      return response;
    } catch (error) {
      throw new PrismaError("Unable to connect unknown words", error, { storyId, wordIds });
    }
  }
}
