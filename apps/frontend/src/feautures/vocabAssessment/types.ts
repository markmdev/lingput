export interface WordRanking {
  id: number;
  source_language: string;
  target_language: string;
  word: string;
  translation: string;
  frequencyRank: number;
}

export interface AssessmentResponse {
  sessionId: string;
  status: "active" | "completed" | "expired";
  wordsToReview?: WordRanking[];
  vocabularySize?: number;
}
