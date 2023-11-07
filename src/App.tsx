import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { NavigationBar } from "@/components";
import { Landing, Login, StoreOwnerDashboard, SiteManagerDashboard } from "@/pages";

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
      { path: "manage", element: <SiteManagerDashboard/> }
    ],
  },
  { path: "login", element: <Login /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
