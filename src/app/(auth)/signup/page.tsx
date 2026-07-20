import { AuthForm } from "@/components/auth/AuthForm";
import { DotGridBackground } from "@/components/puzzle/DotGridBackground";
import { signup } from "@/app/(auth)/actions";

export default function SignupPage() {
  return (
    <DotGridBackground className="flex-1 flex items-center justify-center p-6">
      <AuthForm mode="signup" action={signup} />
    </DotGridBackground>
  );
}
