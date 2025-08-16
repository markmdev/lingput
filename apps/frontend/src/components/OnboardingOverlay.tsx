import { useState } from "react";

export default function OnboardingOverlay({ onComplete }: { onComplete: () => void }) {
  const steps: { title: string; description: string }[] = [
    {
      title: "Welcome to Lingput!",
      description:
        "This short tour will help you get started. You can skip it anytime and revisit later.",
    },
    {
      title: "Top & Left Panels",
      description:
        "Use the top panel to switch views. The left panel lists your stories; click any to open it.",
    },
    {
      title: "Generate a Story",
      description:
        "In 'New Story' view, enter a topic (or pick a suggested one) and press Generate to create a story.",
    },
    {
      title: "Practice Vocabulary",
      description:
        "Open a story to see vocabulary. Mark words as Learning or Learned to track your progress.",
    },
  ];

  const [stepIndex, setStepIndex] = useState(0);

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="bg-white/90 border border-slate-100 rounded-2xl shadow-sm p-8 w-[90vw] max-w-xl text-center">
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 w-2 rounded-full ${
                  idx <= stepIndex ? "bg-indigo-600" : "bg-slate-300"
                }`}
              />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{steps[stepIndex].title}</h2>
          <p className="text-slate-700">{steps[stepIndex].description}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            className="text-slate-500 hover:text-slate-700 px-3 py-2"
            onClick={() => onComplete()}
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold shadow-sm ${
                isFirst ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"
              }`}
              disabled={isFirst}
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            >
              Back
            </button>
            {!isLast && (
              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm"
                onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
              >
                Next
              </button>
            )}
            {isLast && (
              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm"
                onClick={() => onComplete()}
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
