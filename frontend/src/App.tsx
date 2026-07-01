import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { CreateCasePage } from "./pages/CreateCasePage";
import { CaseDetailPage } from "./pages/CaseDetailPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}