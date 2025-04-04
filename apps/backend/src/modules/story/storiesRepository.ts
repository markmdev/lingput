import client from "../../services/supabase";
import { DBResponse, StorageResponse } from "../../types/repositories";
import { Base64 } from "../../types/types";
import { Story, StoryDB } from "./story.types";

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
  async getAllStories(): DBResponse<StoryDB[]> {
    const { data, error } = await client.from("story").select();
    return { data, error };
  }

  async saveStoryToDB(story: Story): DBResponse<StoryDB> {
    const { data, error } = await client
      .from("story")
      .insert({
        story: story.story,
        translation: story.translation,
        audio_url: story.audioUrl,
      })
      .select()
      .single();
    return { data, error };
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
}
