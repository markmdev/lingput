import { Base64 } from "@/types/types";
import { CreateStoryDTO, StoryWithUnknownWords } from "./story.types";
import { PrismaClient, Story } from "@prisma/client";
import { StorageError } from "@/errors/StorageError";
import { NotFoundError } from "@/errors/NotFoundError";
import { PrismaError } from "@/errors/PrismaError";
import { SupabaseClient } from "@supabase/supabase-js";
function getRandomFileName(extension: string) {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
}

function base64ToArrayBuffer(base64: Base64) {
  const binary = Buffer.from(base64, "base64");
  return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength);
}

export class StoryRepository {
  constructor(private prisma: PrismaClient, private storageClient: SupabaseClient) {}
  async getAllStories(userId: number): Promise<Story[]> {
    try {
      return this.prisma.story.findMany({
        where: {
          userId,
        },
        include: {
          unknownWords: true,
        },
      });
    } catch (error) {
      throw new PrismaError("Can't get all stories", error, { userId });
    }
  }

  async saveStoryToDB(story: CreateStoryDTO): Promise<Story> {
    try {
      const savedStory = await this.prisma.story.create({
        data: story,
      });
      return savedStory;
    } catch (error) {
      throw new PrismaError("Can't save story to db", error, { story });
    }
  }

  // save story audio to storage (.mp3)
  async saveStoryAudioToStorage(story: Base64): Promise<string> {
    const fileName = getRandomFileName("mp3");
    // story to ArrayBuffer
    const arrayBuffer = base64ToArrayBuffer(story);
    const { data, error } = await this.storageClient.storage.from("stories").upload(fileName, arrayBuffer, {
      contentType: "audio/mpeg",
    });

    if (error) {
      throw new StorageError("Can't save story audio to storage", error, { fileName });
    }
    if (!data) {
      throw new StorageError("Story audio wasn't saved", error, { fileName });
    }

    return data.path;
  }

  async getSignedStoryAudioUrl(audioPath: string, storyId: number): Promise<string> {
    const { data, error } = await this.storageClient.storage.from("stories").createSignedUrl(audioPath, 60 * 60);
    if (error) {
      throw new StorageError("Can't get story audio", error, { storyId, audioPath });
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

  async connectUnknownWords(storyId: number, wordIds: { id: number }[]): Promise<StoryWithUnknownWords> {
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
      throw new PrismaError("Can't connect unknown words", error, { storyId, wordIds });
    }
  }
}
