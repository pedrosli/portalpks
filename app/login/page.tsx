import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-400/30 via-purple-400/20 to-transparent blur-3xl"
      />

      <div className="card relative flex w-full max-w-sm flex-col items-center gap-8 px-8 py-10">
        <div className="text-center">
          <h1 className="gradient-text text-2xl font-extrabold tracking-tight">
            PKS Portal
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
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
