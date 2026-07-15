import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import type { Profile } from "@/lib/types";

export default function NavBar({ profile }: { profile: Profile | null }) {
  const isAdmin = profile?.role === "admin";
  const initial = (profile?.name || profile?.email || "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-10 border-b border-violet-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/imoveis" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-small.png"
              alt="PKS Administração"
              className="h-8 w-8 rounded-full object-cover shadow-sm ring-1 ring-violet-100"
            />
            <span className="gradient-text text-lg font-extrabold tracking-tight">
              PKS Portal
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium text-neutral-600">
            <Link
              href="/imoveis"
              className="rounded-lg px-3 py-1.5 transition-colors hover:bg-violet-50 hover:text-violet-800"
            >
              Imóveis
            </Link>
            {isAdmin && (
              <Link
                href="/admin/imoveis"
                className="rounded-lg px-3 py-1.5 transition-colors hover:bg-violet-50 hover:text-violet-800"
              >
                Painel admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {profile?.name && (
            <span className="hidden text-sm text-neutral-500 sm:inline">
              {profile.name}
            </span>
          )}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-700 text-xs font-bold text-white shadow-sm shadow-violet-600/30">
            {initial}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
