import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  }))
);

const CreateCasePage = lazy(() =>
  import("./pages/CreateCasePage").then((module) => ({
    default: module.CreateCasePage,
  }))
);

const CaseDetailPage = lazy(() =>
  import("./pages/CaseDetailPage").then((module) => ({
    default: module.CaseDetailPage,
  }))
);

const SatImportLogsPage = lazy(() =>
  import("./pages/SatImportLogsPage").then((module) => ({
    default: module.SatImportLogsPage,
  }))
);

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
        </div>

        <h2 className="text-lg font-black text-slate-900">
          Cargando información
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Estamos preparando los datos del expediente KYB.
        </p>

        <div className="mt-6 space-y-3">
          <div className="h-3 animate-pulse rounded-full bg-slate-100" />
          <div className="h-3 animate-pulse rounded-full bg-slate-100" />
          <div className="mx-auto h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: withSuspense(<DashboardPage />),
      },
      {
        path: "cases/new",
        element: withSuspense(<CreateCasePage />),
      },
      {
        path: "cases/:id",
        element: withSuspense(<CaseDetailPage />),
      },
      {
        path: "sat/imports",
        element: withSuspense(<SatImportLogsPage />),
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}