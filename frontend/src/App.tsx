import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router-dom";
import { Layout } from "./components/Layout";

import { DashboardPage } from "./pages/DashboardPage";
import { CreateCasePage } from "./pages/CreateCasePage";
import { CaseDetailPage } from "./pages/CaseDetailPage";
import { SatImportLogsPage } from "./pages/SatImportLogsPage";
import { ErrorPage } from "./pages/ErrorPage";
import { LandingPage } from "./pages/LandingPage";

function LegacyCaseRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/app/cases/${id}` : "/app"} replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/app",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "cases/new",
        element: <CreateCasePage />,
      },
      {
        path: "cases/:id",
        element: <CaseDetailPage />,
      },
      {
        path: "sat/imports",
        element: <SatImportLogsPage />,
      },
    ],
  },
  {
    path: "/cases/new",
    element: <Navigate to="/app/cases/new" replace />,
  },
  {
    path: "/cases/:id",
    element: <LegacyCaseRedirect />,
  },
  {
    path: "/sat/imports",
    element: <Navigate to="/app/sat/imports" replace />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
