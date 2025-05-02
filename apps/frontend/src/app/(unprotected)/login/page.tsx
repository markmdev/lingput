"use client";
import { useState } from "react";
import { login } from "../../../lib/api";
import { useRouter } from "next/navigation";
import { ApiError } from "@/types/ApiError";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Trying to login");
    try {
      await login({ email, password });
      console.log("Success");
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error);
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}></input>
        <label htmlFor="password">Password</label>
        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
        <button type="submit">Login</button>
        <p className="text-red-500">{error?.message}</p>
      </form>
    </div>
  );
}
