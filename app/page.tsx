import Link from "next/link";
import KeyIcon from "@/components/icons/KeyIcon";

export default function Home() {
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

      <div className="card relative flex w-full max-w-md flex-col items-center gap-6 px-8 py-12 text-center">
        <h1 className="gradient-text brand-font text-4xl font-extrabold">
          Portal PKS
        </h1>
        <p className="text-sm text-neutral-500">
          Fotos e informações dos imóveis disponíveis para aluguel, prontas
          para você levar ao seu cliente.
        </p>
        <Link href="/imoveis" className="btn-primary w-full text-base">
          Acessar imóveis
        </Link>
        <Link
          href="/login"
          className="text-xs text-neutral-400 transition-colors hover:text-neutral-600"
        >
          Área administrativa
        </Link>
      </div>
    </div>
  );
}
