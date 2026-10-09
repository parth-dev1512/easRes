import { AuthForm } from "@/components/auth/AuthForm";
import { DotGridBackground } from "@/components/puzzle/DotGridBackground";
import { login } from "@/app/(auth)/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <DotGridBackground className="flex-1 flex flex-col gap-4 items-center justify-center p-6">
      {error && (
        <p className="text-sm font-medium text-puzzle-red">
          Sign-in failed. Please try again.
        </p>
      )}
      <AuthForm mode="login" action={login} />
    </DotGridBackground>
  );
}
