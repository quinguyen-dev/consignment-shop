import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import logo from "~/assets/logo.png";
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
  const navigate = useNavigate();
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

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="px-8">
        <QueryClientProvider client={queryClient}>
          <div className="space-x-2 pt-6 flex items-center">
            <Link to="/" className="max-w-[72px] min-w-[72px] aspect-square">
              <img src={logo} alt="logo" />
            </Link>
            <div className="w-full">
              <form
                action=""
                className="flex overflow-hidden rounded-xl border-2 border-gray-200 focus-within:border-2 focus-within:border-blue-500"
              >
                <button
                  className="inline-flex items-center bg-gray-200 py-2.5 px-4 text-gray-600 text-sm"
                  type="button"
                >
                  All stores{" "}
                  <svg
                    className="w-2.5 h-2.5 ms-2.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>
                <input
                  className="flex-1 text-sm pl-3 outline-0"
                  placeholder="Search for computers"
                />
              </form>
            </div>
            {/* {isAuthenticated && (
              <Link
                to="/owner"
                className="flex items-center rounded-md border-2 px-4 text-center"
              >
                Account
              </Link>
            )} */}
            <button
              className="rounded-xl px-4 min-w-[96px] text-center bg-[#48576B] text-white text-sm h-[44px]"
              onClick={() => navigate("/auth/callback")}
            >
              {isAuthenticated ? "Log Out" : "Log In"}
            </button>
          </div>
          <Outlet />
        </QueryClientProvider>
      </div>
      <button
        className="w-full py-4 bg-[#48576A] text-white text-sm mt-4"
        onClick={scrollToTop}
      >
        Back to the top
      </button>
      <footer className="bg-[#242F3E] py-6 text-center">
        <p className="text-white">NewerEgg</p>
      </footer>
    </>
  );
}
