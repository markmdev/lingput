export default function NewStoryButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="bg-blue-600 px-4 py-2 rounded-lg text-white font-bold cursor-pointer" onClick={onClick}>
      Generate New Story
    </button>
  );
}
