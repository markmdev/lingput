export default function ContinueButton({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`py-2 px-6 text-xl font-semibold border rounded-sm flex-shrink w-fit ${
        isActive
          ? "bg-green-400 cursor-pointer text-white"
          : "bg-gray-300 cursor-not-allowed text-black"
      }`}
      onClick={onClick}
      disabled={isActive}
    >
      Submit
    </button>
  );
}
