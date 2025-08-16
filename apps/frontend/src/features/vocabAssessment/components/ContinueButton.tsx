export default function ContinueButton({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`py-2.5 px-6 text-lg font-semibold rounded-lg flex-shrink w-fit transition-colors shadow-sm ${
        isActive
          ? "bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600"
          : "bg-slate-200 text-slate-700 cursor-not-allowed"
      }`}
      onClick={onClick}
      disabled={isActive}
    >
      Submit
    </button>
  );
}
