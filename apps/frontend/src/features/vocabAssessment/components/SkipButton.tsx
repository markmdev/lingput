import Link from "next/link";

export default function SkipButton() {
  return (
    <Link
      href="/vocab-assessment/skip"
      className="py-2 px-8 text-lg bg-red-500 font-semibold rounded-lg text-white hover:bg-red-600 transition-colors cursor-pointer"
    >
      Skip
    </Link>
  );
}
