import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import { NavigationBar } from "@/components";
import {
  Landing,
  Login,
  StoreOwnerDashboard,
  SiteManagerDashboard,
  InventoryManager,
} from "@/pages";
import { AuthProvider } from "react-oauth2-code-pkce";

function RootLayout() {
  const navigate = useNavigate();

  return (
    <AuthProvider
      authConfig={{
        clientId: "6ra4r9q3m3nd9v8bkolqiittsk",
        authorizationEndpoint:
          "https://cs509-newegg.auth.us-east-2.amazoncognito.com/oauth2/authorize",
        tokenEndpoint:
          "https://cs509-newegg.auth.us-east-2.amazoncognito.com/oauth2/token",
        logoutEndpoint:
          "https://cs509-newegg.auth.us-east-2.amazoncognito.com/logout",
        extraLogoutParameters: {
          logout_uri: new URL(location.origin).toString(),
        },
        redirectUri: new URL(location.origin).toString(),
        scope: "openid profile email aws.cognito.signin.user.admin",
        autoLogin: false,
        postLogin: () => {
          const item = JSON.parse(
            sessionStorage.getItem("ROCP_auth_state") ?? "null"
          );

          if (sessionStorage.getItem("ROCP_auth_state")) {
            sessionStorage.removeItem("ROCP_auth_state");
          }

          navigate(item?.returnTo ?? location.pathname);
        },
      }}
    >
      <div className="p-6">
        <NavigationBar />
        <Outlet />
      </div>
    </AuthProvider>
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
  { path: "login", element: <Login /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
