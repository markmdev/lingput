import { UnknownWord } from "@/types/ApiObjects";

export interface Story {
  id: number;
  storyText: string;
  translationText: string;
  audioUrl: string;
  unknownWords: UnknownWord[];
  userId: number;
}
