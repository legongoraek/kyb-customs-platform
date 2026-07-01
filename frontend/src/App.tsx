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
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
      Cargando...
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