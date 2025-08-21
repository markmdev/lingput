import { AudioAssembler } from "./audioAssembler";
import { StoryAudioStorageService } from "./storyAudioStorageService";
import { TextToSpeechService } from "./textToSpeechService";

jest.mock("./audioUtils", () => ({
  generateSilence: jest.fn().mockResolvedValue("SILENCE"),
  combineAudioFromBase64: jest.fn().mockResolvedValue("COMBINED_AUDIO"),
}));

import { generateSilence, combineAudioFromBase64 } from "./audioUtils";

describe("AudioAssembler", () => {
  afterEach(() => jest.clearAllMocks());

  it("assembles audio: generates silences, calls TTS in order, combines and saves", async () => {
    const storage = {
      saveToStorage: jest.fn().mockResolvedValue("audio-url.mp3"),
    } as unknown as StoryAudioStorageService;

    const tts = {
      textToSpeech: jest.fn().mockResolvedValue("AUDIO"),
    } as unknown as TextToSpeechService;

    const assembler = new AudioAssembler(storage, tts);

    const translationChunks = [{ chunk: "Hallo Welt", translatedChunk: "Hello world" }];
    const unknownWords: any[] = [];

    const url = await assembler.assemble(translationChunks, unknownWords, "DE", "EN");

    // Silences generated
    expect(generateSilence).toHaveBeenCalledWith(2);
    expect(generateSilence).toHaveBeenCalledWith(1);
    expect(generateSilence).toHaveBeenCalledWith(0.3);

    // TTS calls: N chunks -> german N, translation 2N, plus 1 transition = 3N + 1
    expect((tts as any).textToSpeech).toHaveBeenCalledTimes(4);
    expect((tts as any).textToSpeech).toHaveBeenCalledWith("Hallo Welt", true, "DE", "EN");
    expect((tts as any).textToSpeech).toHaveBeenCalledWith(
      "Now listen to the story with translation.",
      false,
      "DE",
      "EN"
    );
    expect((tts as any).textToSpeech).toHaveBeenCalledWith("Hallo Welt", true, "DE", "EN");
    expect((tts as any).textToSpeech).toHaveBeenCalledWith("Hello world", false, "DE", "EN");

    // Combining and saving
    expect(combineAudioFromBase64).toHaveBeenCalled();
    expect((storage as any).saveToStorage).toHaveBeenCalledWith("COMBINED_AUDIO");
    expect(url).toBe("audio-url.mp3");
  });
});
