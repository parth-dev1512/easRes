import { AuthForm } from "@/components/auth/AuthForm";
import { DotGridBackground } from "@/components/puzzle/DotGridBackground";
import { login } from "@/app/(auth)/actions";

export default function LoginPage() {
  return (
    <DotGridBackground className="flex-1 flex items-center justify-center p-6">
      <AuthForm mode="login" action={login} />
    </DotGridBackground>
  );
}
