import Link from "next/link";

export default function AssessmentRequiredOverlay({ wordsCount }: { wordsCount: number }) {
  if (wordsCount !== 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="bg-white/90 border border-slate-100 rounded-2xl shadow-sm p-8 w-[90vw] max-w-lg text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Vocabulary assessment required</h1>
        <p className="text-slate-700 mb-6">
          Please complete the <span className="font-semibold">vocab-assessment</span> first so we
          can prepare personalized stories for you.
        </p>
        <Link
          href="/vocab-assessment"
          className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Take assessment
        </Link>
      </div>
    </div>
  );
}
