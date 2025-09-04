"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiError } from "@/types/ApiError";
import { register } from "@/features/auth/api.client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await register({ email, password });
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 justify-center bg-white/80 py-10 px-8 sm:px-16 rounded-2xl shadow-sm border border-slate-100 backdrop-blur-sm w-[90vw] max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 text-center">Create your account</h1>
          <label htmlFor="email" className="font-medium text-slate-800">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-2.5 px-4 bg-white rounded-lg border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-400"
          ></input>
          <label htmlFor="password" className="font-medium text-slate-800">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-2.5 px-4 bg-white rounded-lg border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-400"
          ></input>
          <button
            type="submit"
            className="bg-emerald-600 py-2.5 px-10 w-full text-lg font-semibold rounded-lg text-white self-center mt-2 cursor-pointer hover:bg-emerald-700 transition-colors"
          >
            Sign up
          </button>
          <p className="text-sm text-slate-600 self-center mt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 underline">
              Log in
            </Link>
          </p>

          <p className="text-xs text-slate-500 text-center mt-3">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-indigo-600">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-indigo-600">
              Privacy Policy
            </Link>
            .
          </p>

          <p className="text-rose-600 text-sm text-center">{error?.message}</p>
        </div>
      </form>
    </div>
  );
}
