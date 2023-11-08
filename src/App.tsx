import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { NavigationBar } from "@/components";
import {
  Landing,
  Register,
  StoreOwnerDashboard,
  SiteManagerDashboard,
  InventoryManager,
} from "@/pages";

function RootLayout() {
  return (
    <div className="p-6">
      <NavigationBar />
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "account", element: <StoreOwnerDashboard /> },
      { path: "inventory", element: <InventoryManager /> },
      { path: "manage", element: <SiteManagerDashboard /> },
    ],
  },
  { path: "register", element: <Register /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
