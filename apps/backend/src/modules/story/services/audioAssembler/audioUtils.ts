import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import * as path from "path";
import * as os from "os";
import { v4 as uuidv4 } from "uuid";
import { Base64 } from "@/types/types";
import { spawn } from "child_process";
import { logger } from "@/utils/logger";

/**
 * Combines multiple base64-encoded audio files into one output, returning the combined audio as a base64 string.
 *
 * @param base64AudioFiles - Array of base64 strings representing audio files.
 * @returns A promise that resolves to the base64 encoded combined audio.
 */
export async function combineAudioFromBase64(
  base64AudioFiles: Base64[][],
): Promise<Base64> {
  // Use the system temporary directory to store intermediate files.
  const tmpDir = os.tmpdir();
  const tempFiles: string[] = [];

  try {
    // Write each base64 audio string to a temporary file.
    for (let i = 0; i < base64AudioFiles.length; i++) {
      for (let j = 0; j < base64AudioFiles[i].length; j++) {
        const tmpFilePath = path.join(tmpDir, `audio-${uuidv4()}.mp3`);
        const buffer = Buffer.from(base64AudioFiles[i][j], "base64");
        await fs.writeFile(tmpFilePath, buffer);
        tempFiles.push(tmpFilePath);
      }
    }

    // Build and run the ffmpeg command using the temporary file paths.
    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      // Add each temporary file as an input.
      tempFiles.forEach((file) => command.input(file));

      // Create the concat filter string for the inputs.
      const filterString =
        tempFiles.map((_, index) => `[${index}:a]`).join("") +
        `concat=n=${tempFiles.length}:v=0:a=1[outa]`;

      // Configure ffmpeg to use the concat filter and set the format.
      command
        .complexFilter(filterString)
        .outputOptions("-map", "[outa]")
        .format("mp3");

      // Pipe the output to a stream instead of a file.
      const outputStream = command.pipe();
      const chunks: Buffer[] = [];

      // Collect data chunks.
      outputStream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      // When the stream ends, concatenate all chunks and convert to base64.
      outputStream.on("end", async () => {
        // Clean up temporary files.
        await Promise.all(tempFiles.map((file) => fs.unlink(file)));
        const buffer = Buffer.concat(chunks);
        const base64Output = buffer.toString("base64");
        logger.info("Audio files combined successfully!");
        resolve(base64Output);
      });

      // Handle errors by cleaning up and rejecting.
      outputStream.on("error", async (err: Error) => {
        await Promise.all(tempFiles.map((file) => fs.unlink(file)));
        reject(err);
      });
    });
  } catch (err) {
    // Ensure cleanup if an error occurs while writing files.
    await Promise.all(tempFiles.map((file) => fs.unlink(file).catch(() => {})));
    throw err;
  }
}

export function generateSilence(
  durationSeconds: number = 0.5,
): Promise<Base64> {
  return new Promise((resolve, reject) => {
    const args = [
      "-nostdin", // Prevent ffmpeg from reading from stdin
      "-f",
      "lavfi",
      "-i",
      "anullsrc=r=44100:cl=mono", // Silent audio input: 44.1kHz, mono
      "-t",
      durationSeconds.toString(), // Duration of the audio
      "-f",
      "mp3", // Output format
      "-q:a",
      "9", // Audio quality for MP3
      "-acodec",
      "libmp3lame", // Audio codec
      "-", // Output to stdout
    ];

    const ffmpeg = spawn("ffmpeg", args);
    const chunks: Buffer[] = [];

    ffmpeg.stdout.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    ffmpeg.on("error", (err) => {
      reject(err);
    });

    ffmpeg.on("close", (code: number) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg exited with code ${code}`));
      } else {
        const buffer = Buffer.concat(chunks);
        const base64Audio = buffer.toString("base64");
        resolve(base64Audio);
      }
    });
  });
}
