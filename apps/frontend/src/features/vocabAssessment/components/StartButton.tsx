export default function StartButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="py-2 px-8 text-lg bg-emerald-500 font-semibold rounded-lg text-white hover:bg-emerald-600 transition-colors cursor-pointer"
      onClick={onClick}
    >
      Start
    </button>
  );
}
