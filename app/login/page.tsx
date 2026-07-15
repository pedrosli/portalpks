import { Suspense } from "react";
import LoginForm from "./LoginForm";
import KeyIcon from "@/components/icons/KeyIcon";

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-400/30 via-purple-400/20 to-transparent blur-3xl"
      />
      <KeyIcon
        aria-hidden
        className="pointer-events-none absolute -left-10 top-24 h-56 w-56 -rotate-12 text-violet-200/60"
      />
      <KeyIcon
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rotate-[18deg] text-purple-200/50"
      />

      <div className="card relative flex w-full max-w-sm flex-col items-center gap-8 px-8 py-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 h-24 w-24 overflow-hidden rounded-full shadow-lg shadow-violet-900/10 ring-1 ring-violet-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.png"
              alt="PKS Administração"
              className="h-full w-full object-cover"
            />
          </div>
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
