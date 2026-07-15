import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import type { Profile } from "@/lib/types";

export default function NavBar({ profile }: { profile: Profile | null }) {
  const isAdmin = profile?.role === "admin";

  return (
    <header className="border-b border-violet-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/imoveis" className="font-semibold text-violet-800">
            PKS Portal
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-600">
            <Link href="/imoveis" className="hover:text-violet-700">
              Imóveis
            </Link>
            {isAdmin && (
              <Link href="/admin/imoveis" className="hover:text-violet-700">
                Painel admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {profile?.name && (
            <span className="text-sm text-neutral-500">{profile.name}</span>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
