export default function StartButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="py-1 px-2 text-lg bg-green-400 font-bold" onClick={onClick}>
      Start
    </button>
  );
}
