import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { NavigationBar } from "@/components";
import { AccountDashboard, Landing, Login } from "@/pages";

function RootLayout() {
  return (
    <div className="p-4">
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
      { path: "account", element: <AccountDashboard /> },
    ],
  },
  { path: "login", element: <Login /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
