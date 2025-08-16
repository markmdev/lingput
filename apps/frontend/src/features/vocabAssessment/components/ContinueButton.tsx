export default function ContinueButton({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  const isDisabled = isActive;
  return (
    <button
      className={`py-2.5 px-6 text-lg font-semibold rounded-lg flex-shrink w-fit transition-colors shadow-sm ${
        isDisabled
          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
          : "bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600"
      }`}
      onClick={onClick}
      disabled={isDisabled}
    >
      Submit
    </button>
  );
}
