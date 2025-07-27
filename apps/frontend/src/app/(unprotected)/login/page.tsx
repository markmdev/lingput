"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/types/ApiError";
import { login } from "@/features/auth/api.client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login({ email, password });
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
        <div className="flex flex-col gap-2 justify-center bg-gray-100 py-10 px-20 rounded-lg shadow-xl border border-gray-200">
          <label htmlFor="email" className="font-bold">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-2 px-4 bg-blue-50 rounded-lg border border-gray-300 text-gray-700"
          ></input>
          <label htmlFor="password" className="font-bold">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-2 px-4 bg-blue-50 rounded-lg border border-gray-300 text-gray-700"
          ></input>
          <button
            type="submit"
            className="bg-blue-500 py-2 px-10 w-fit text-xl font-semibold rounded-lg text-white self-center mt-4 cursor-pointer"
          >
            Login
          </button>
          <p className="text-red-500">{error?.message}</p>
        </div>
      </form>
    </div>
  );
}
