import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { authenticator } from "~/services/auth.server";

/* Loader to fetch the API url from the environment and pass it to the frontend */
export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    isAuthenticated: (await authenticator.isAuthenticated(request))
      ? true
      : false,
  });
}

export default function AppLayout() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
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
