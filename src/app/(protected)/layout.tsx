import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The proxy already validated the session and stamped this header —
  // re-checking with another auth.getUser() network call is redundant here.
  const userId = (await headers()).get("x-user-id");

  if (!userId) {
    redirect("/login");
  }

  return <>{children}</>;
}
