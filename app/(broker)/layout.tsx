import NavBar from "@/components/NavBar";
import { getCurrentProfile } from "@/lib/auth";

export default async function BrokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-1 flex-col">
      <NavBar profile={profile} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
