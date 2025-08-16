import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export type CoachmarkStep = {
  selector?: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  showBack?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  backLabel?: string;
  disableNext?: boolean;
};

export default function OnboardingCoachmarks({
  step,
  onNext,
  onBack,
  onSkip,
}: {
  step: CoachmarkStep;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [targetExists, setTargetExists] = useState(true);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const targetEl = useMemo(() => {
    if (!step.selector) return null;
    if (typeof window === "undefined") return null;
    return document.querySelector(step.selector) as HTMLElement | null;
  }, [step.selector]);

  useEffect(() => {
    setTargetExists(step.selector ? !!targetEl : true);
  }, [step.selector, targetEl]);

  useLayoutEffect(() => {
    const compute = () => {
      if (!step.selector || !targetEl || !popoverRef.current) {
        setPosition(null);
        return;
      }
      const rect = targetEl.getBoundingClientRect();
      const pop = popoverRef.current.getBoundingClientRect();
      const margin = 12;
      let top = rect.top + window.scrollY;
      let left = rect.left + window.scrollX;
      const arrowPos: { top?: number; left?: number } = {};

      const placement = step.placement || "auto";
      const available = {
        top: rect.top,
        bottom: window.innerHeight - rect.bottom,
        left: rect.left,
        right: window.innerWidth - rect.right,
      };

      const chosen =
        placement !== "auto"
          ? placement
          : available.bottom >= pop.height + margin
          ? "bottom"
          : available.top >= pop.height + margin
          ? "top"
          : available.right >= pop.width + margin
          ? "right"
          : "left";

      if (chosen === "bottom") {
        top = rect.bottom + window.scrollY + margin;
        left = rect.left + window.scrollX + Math.max(0, rect.width / 2 - pop.width / 2);
        arrowPos.top = -8;
      } else if (chosen === "top") {
        top = rect.top + window.scrollY - pop.height - margin;
        left = rect.left + window.scrollX + Math.max(0, rect.width / 2 - pop.width / 2);
        arrowPos.top = pop.height - 4;
      } else if (chosen === "right") {
        top = rect.top + window.scrollY + Math.max(0, rect.height / 2 - pop.height / 2);
        left = rect.right + window.scrollX + margin;
        arrowPos.left = -8;
      } else {
        top = rect.top + window.scrollY + Math.max(0, rect.height / 2 - pop.height / 2);
        left = rect.left + window.scrollX - pop.width - margin;
        arrowPos.left = pop.width - 4;
      }

      left = Math.max(12, Math.min(left, window.scrollX + window.innerWidth - pop.width - 12));

      setPosition({ top, left });
    };

    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, { passive: true });
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute);
    };
  }, [step.selector, step.placement, targetEl]);

  useEffect(() => {
    if (!targetEl) return;
    const originalOutline = targetEl.style.outline;
    const originalOutlineOffset = targetEl.style.outlineOffset;
    targetEl.style.outline = "3px solid rgb(79 70 229)";
    targetEl.style.outlineOffset = "2px";
    return () => {
      targetEl.style.outline = originalOutline;
      targetEl.style.outlineOffset = originalOutlineOffset;
    };
  }, [targetEl]);

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/20 pointer-events-none"></div>

      <div
        ref={popoverRef}
        className="absolute z-[70] bg-white/95 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-lg p-4 w-[90vw] max-w-sm pointer-events-auto"
        style={{ top: position?.top ?? 100, left: position?.left ?? 20 }}
      >
        {!targetExists && step.selector && (
          <div className="text-sm text-amber-600 mb-2">Looking for target element...</div>
        )}
        <h3 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h3>
        <p className="text-slate-700 mb-3 text-sm">{step.description}</p>
        <div className="flex items-center justify-between gap-2">
          <button className="text-slate-500 hover:text-slate-700 px-2 py-1" onClick={onSkip}>
            Skip
          </button>
          <div className="flex items-center gap-2">
            {step.showBack && (
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold shadow-sm hover:bg-slate-50"
                onClick={onBack}
              >
                {step.backLabel || "Back"}
              </button>
            )}
            {step.showNext && (
              <button
                className={`px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold shadow-sm ${
                  step.disableNext ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
                }`}
                disabled={step.disableNext}
                onClick={onNext}
              >
                {step.nextLabel || "Next"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
