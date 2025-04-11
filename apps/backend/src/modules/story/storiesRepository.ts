import client from "@/services/supabase";
import { Base64 } from "@/types/types";
import { CreateStoryDTO, StoryWithUnknownWords } from "./story.types";
import { Story } from "@prisma/client";
import { StorageError } from "@/errors/StorageError";
import { NotFoundError } from "@/errors/NotFoundError";
import { PrismaError } from "@/errors/PrismaError";
import { prisma } from "@/services/prisma";
function getRandomFileName(extension: string) {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
}

function base64ToArrayBuffer(base64: Base64) {
  const binary = Buffer.from(base64, "base64");
  return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength);
}

export class StoriesRepository {
  async getAllStories(userId: number): Promise<Story[]> {
    try {
      return prisma.story.findMany({
        where: {
          userId,
        },
        include: {
          unknownWords: true,
        },
      });
    } catch (error) {
      throw new PrismaError("Can't get all stories", {}, error);
    }
  }

  async saveStoryToDB(story: CreateStoryDTO): Promise<Story> {
    try {
      const savedStory = await prisma.story.create({
        data: story,
      });
      return savedStory;
    } catch (error) {
      throw new PrismaError("Can't save story to db", { story }, error);
    }
  }

  // save story audio to storage (.mp3)
  async saveStoryAudioToStorage(story: Base64): Promise<string> {
    const fileName = getRandomFileName("mp3");
    // story to ArrayBuffer
    const arrayBuffer = base64ToArrayBuffer(story);
    const { data, error } = await client.storage.from("stories").upload(fileName, arrayBuffer, {
      contentType: "audio/mpeg",
    });

    if (error) {
      throw new StorageError("Can't save story audio to storage");
    }
    if (!data) {
      throw new StorageError("Story audio wasn't saved");
    }

    return data.path;
  }

  async getSignedStoryAudioUrl(audioPath: string, storyId: number): Promise<string> {
    const { data, error } = await client.storage.from("stories").createSignedUrl(audioPath, 60 * 60);
    if (error) {
      throw new StorageError("Can't get story audio", { storyId, audioPath });
    }
    if (!data) {
      throw new NotFoundError("Story audio", { storyId, audioPath });
    }
    return data.signedUrl;
  }

  async getStoryById(storyId: number): Promise<Story> {
    const story = await prisma.story.findUnique({
      where: {
        id: storyId,
      },
      include: {
        unknownWords: true,
      },
    });
    if (!story) {
      throw new NotFoundError("Story", { storyId });
    }
    return story;
  }

  async connectUnknownWords(storyId: number, wordIds: { id: number }[]): Promise<StoryWithUnknownWords> {
    try {
      const response = await prisma.story.update({
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
      throw new PrismaError("Can't connect unknown words", { storyId, wordIds }, error);
    }
  }
}
