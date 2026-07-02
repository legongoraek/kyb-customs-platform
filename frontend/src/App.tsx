import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { wakeUpBackend } from "./api/kybApi";

import { DashboardPage } from "./pages/DashboardPage";
import { CreateCasePage } from "./pages/CreateCasePage";
import { CaseDetailPage } from "./pages/CaseDetailPage";
import { SatImportLogsPage } from "./pages/SatImportLogsPage";
import { ErrorPage } from "./pages/ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
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
]);

export default function App() {
  useEffect(() => {
    wakeUpBackend();
  }, []);

  return <RouterProvider router={router} />;
}