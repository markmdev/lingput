export const dynamic = "force-dynamic";
import { getCurrentUser } from "@/feautures/auth/api.server";
import { redirect } from "next/navigation";

export default async function UnprotectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return <div>{children}</div>;
}
