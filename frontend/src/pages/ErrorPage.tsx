import { Link, useRouteError } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError();

  console.error("Route error:", error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-red-600">
          Error de aplicación
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-900">
          No se pudo cargar esta sección
        </h1>

        <p className="mt-3 text-slate-500">
          Intenta actualizar la página. Si el backend estaba en reposo, espera
          unos segundos y vuelve a cargar.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
        >
          Volver al dashboard
        </Link>
      </section>
    </main>
  );
}