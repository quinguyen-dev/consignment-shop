import { LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Link,
  MetaFunction,
  Outlet,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { authenticator } from "~/services/auth.server";

// Loader to fetch the API url from the environment and pass it to the frontend
export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    apiBaseUrl: process.env.API_BASE_URL,
    isAuthenticated: (await authenticator.isAuthenticated(request))
      ? true
      : false,
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Computer Consignment Shop" },
    {
      name: "description",
      content: "Welcome to our computer consignment shop!",
    },
  ];
};

axios.defaults.baseURL =
  "https://vo8vlr6cyc.execute-api.us-east-2.amazonaws.com/dev";

const URL = "https://cs509-newegg.auth.us-east-2.amazoncognito.com";
export default function AppLayout() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  const navigate = useNavigate();

  return (
    <div className="p-4">
      <QueryClientProvider client={queryClient}>
        <div className="flex h-12 flex-row space-x-2">
          <Link
            to="/"
            className="text-gray-00 min-w-[256px] border px-4 py-3 text-center"
          >
            Website Logo / Name
          </Link>
          <input
            className="flex-1 border-2 px-4"
            placeholder="Search for items"
            type="search"
          />
          {isAuthenticated && (
            <Link
              to="/owner"
              className="flex items-center rounded-md border-2 px-4 text-center"
            >
              Account
            </Link>
          )}
          <button
            className="flex items-center rounded-md border-2 px-4 text-center"
            onClick={() => navigate("/auth/callback")}
          >
            {isAuthenticated ? "Log Out" : "Log In"}
          </button>
        </div>
        <Outlet />
      </QueryClientProvider>
    </div>
  );
}
