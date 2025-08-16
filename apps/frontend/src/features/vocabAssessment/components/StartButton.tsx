export default function StartButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="py-2 px-4 text-lg bg-emerald-500 font-semibold rounded-lg text-white hover:bg-emerald-600 transition-colors"
      onClick={onClick}
    >
      Start
    </button>
  );
}
