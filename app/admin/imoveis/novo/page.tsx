import PropertyForm from "@/components/admin/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
        Novo <span className="gradient-text">imóvel</span>
      </h1>
      <p className="text-sm text-neutral-500">
        Depois de criar o imóvel, você poderá adicionar as fotos.
      </p>
      <PropertyForm />
    </div>
  );
}
