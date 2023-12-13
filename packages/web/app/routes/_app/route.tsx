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
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
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

{
  /* <form>
    <div class="flex">
        <label for="search-dropdown" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Your Email</label>
        <button id="dropdown-button" data-dropdown-toggle="dropdown" class="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600" type="button">All categories <svg class="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
  </svg></button>
        <div id="dropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdown-button">
            <li>
                <button type="button" class="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mockups</button>
            </li>
            <li>
                <button type="button" class="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Templates</button>
            </li>
            <li>
                <button type="button" class="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Design</button>
            </li>
            <li>
                <button type="button" class="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Logos</button>
            </li>
            </ul>
        </div>
        <div class="relative w-full">
            <input type="search" id="search-dropdown" class="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-s-gray-700  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500" placeholder="Search Mockups, Logos, Design Templates..." required>
            <button type="submit" class="absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
                <span class="sr-only">Search</span>
            </button>
        </div>
    </div>
</form> */
}
