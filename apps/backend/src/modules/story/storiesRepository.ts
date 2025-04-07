import client from "../../services/supabase";
import { DBResponse, StorageResponse } from "../../types/repositories";
import { Base64 } from "../../types/types";
import { CreateStoryDTO } from "./story.types";
import { Prisma, PrismaClient, Story } from "@prisma/client";

const prisma = new PrismaClient();

function getRandomFileName(extension: string) {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 15)}.${extension}`;
}

function base64ToArrayBuffer(base64: Base64) {
  const binary = Buffer.from(base64, "base64");
  return binary.buffer.slice(
    binary.byteOffset,
    binary.byteOffset + binary.byteLength
  );
}

export class StoriesRepository {
  async getAllStories(): Promise<Story[]> {
    return prisma.story.findMany();
  }

  async saveStoryToDB(story: CreateStoryDTO): Promise<Story> {
    const { unknownWords, ...storyWithoutUnknownWords } = story;
    const savedStory = await prisma.story.create({
      data: storyWithoutUnknownWords,
    });
    return savedStory;
  }

  // save story audio to storage (.mp3)
  async saveStoryAudioToStorage(
    story: Base64
  ): Promise<StorageResponse<{ id: string; path: string; fullPath: string }>> {
    const fileName = getRandomFileName("mp3");
    // story to ArrayBuffer
    const arrayBuffer = base64ToArrayBuffer(story);
    const { data, error } = await client.storage
      .from("stories")
      .upload(fileName, arrayBuffer, {
        contentType: "audio/mpeg",
      });

    return { data, error };
  }

  async getSignedStoryAudioUrl(
    audioPath: string
  ): Promise<StorageResponse<{ signedUrl: string }>> {
    const { data, error } = await client.storage
      .from("stories")
      .createSignedUrl(audioPath, 60 * 60);
    return { data, error };
  }

  async getStoryById(storyId: number): Promise<Story | null> {
    const story = await prisma.story.findFirst({
      where: {
        id: {
          equals: storyId,
        },
      },
    });
    return story;
  }
}
