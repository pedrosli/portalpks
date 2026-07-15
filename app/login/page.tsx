import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Hub de Imóveis</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Entre com o email e senha fornecidos pela imobiliária.
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
