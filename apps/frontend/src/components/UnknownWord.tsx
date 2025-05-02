import { UnknownWord } from "../types/ApiObjects";
export default function UnknownWordComponent({ unknownWord }: { unknownWord: UnknownWord }) {
  return (
    <div className="border-1 p-2">
      <p>
        <b>Word:</b> {unknownWord.word}
      </p>
      <p>
        <b>Translation:</b> {unknownWord.translation}
      </p>
      <p>
        <b>Article:</b> {unknownWord.article}
      </p>
      <p>
        <b>Times seen:</b> {unknownWord.timesSeen}
      </p>
      <p>
        <b>Example:</b> {unknownWord.exampleSentence}
      </p>
      <p>
        <b>Example translation:</b> {unknownWord.exampleSentenceTranslation}
      </p>
      <p>
        <b>Status:</b> {unknownWord.status}
      </p>
    </div>
  );
}
