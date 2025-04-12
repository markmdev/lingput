export interface UserVocabularyDTO {
  word: string;
  translation: string;
  article: string | null;
}

export interface UserVocabularyWithUserIdDTO extends UserVocabularyDTO {
  userId: number;
}
