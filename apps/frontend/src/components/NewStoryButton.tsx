export default function NewStoryButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="bg-blue-500 px-4 py-3 rounded-lg text-white font-bold cursor-pointer" onClick={onClick}>
      Generate New Story
    </button>
  );
}
