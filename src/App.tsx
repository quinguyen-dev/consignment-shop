import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AccountDashboard, Landing } from "@/pages";

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "account", element: <AccountDashboard /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
