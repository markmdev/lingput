export default function SuggestedTopic({
  topic,
  onSelectTopic,
}: {
  topic: string;
  onSelectTopic: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      className="border rounded-lg text-gray-500 py-1 px-2 text-sm cursor-pointer"
      onClick={onSelectTopic}
      data-onboarding={`suggested-topic-${topic}`}
    >
      {topic}
    </button>
  );
}
