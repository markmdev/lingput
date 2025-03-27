import client from "../../services/supabase";
import { DBResponse, StorageResponse } from "../../types/repositories";
import { Base64 } from "../../types/types";

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
  // save story to storage (.mp3)
  async saveStoryToStorage(story: Base64): StorageResponse<string> {
    const fileName = getRandomFileName("mp3");
    // story to ArrayBuffer
    const arrayBuffer = base64ToArrayBuffer(story);
    const { data, error } = await client.storage
      .from("stories")
      .upload(fileName, arrayBuffer, {
        contentType: "audio/mpeg",
      });

    if (error) {
      return { data: null, error };
    }

    return { data: fileName, error: null };
  }
}
