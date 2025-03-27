import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import * as path from "path";
import * as os from "os";
import { v4 as uuidv4 } from "uuid";
import { Base64 } from "../../types/types";
/**
 * Combines multiple base64-encoded audio files into one output file.
 *
 * @param base64AudioFiles - Array of base64 strings representing audio files.
 * @param outputFile - The path for the combined output file.
 * @returns A promise that resolves when the combining is complete.
 */
export async function combineAudioFromBase64(
  base64AudioFiles: Base64[][],
  outputFile: string
): Promise<void> {
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

      tempFiles.forEach((file) => command.input(file));

      // Create the concat filter string for the inputs.
      const filterString =
        tempFiles.map((_, index) => `[${index}:a]`).join("") +
        `concat=n=${tempFiles.length}:v=0:a=1[outa]`;

      command
        .complexFilter(filterString)
        .outputOptions("-map", "[outa]")
        .output(outputFile)
        .on("end", async () => {
          // Clean up temporary files.
          await Promise.all(tempFiles.map((file) => fs.unlink(file)));
          console.log("Audio files combined successfully!");
          resolve();
        })
        .on("error", async (err: Error) => {
          // Clean up temporary files in case of error.
          await Promise.all(tempFiles.map((file) => fs.unlink(file)));
          console.error("Error:", err.message);
          reject(err);
        })
        .run();
    });
  } catch (err) {
    // Ensure cleanup if an error occurs while writing files.
    await Promise.all(tempFiles.map((file) => fs.unlink(file).catch(() => {})));
    throw err;
  }
}

export default combineAudioFromBase64;
