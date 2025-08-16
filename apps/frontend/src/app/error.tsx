"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    toast.error(error.message);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm max-w-md w-full border border-slate-100">
        <h2 className="text-2xl font-bold text-rose-600 mb-3">Something went wrong!</h2>
        <p className="text-slate-700 mb-6">{error.message}</p>
        <button
          onClick={() => reset()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
