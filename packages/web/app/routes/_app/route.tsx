import {
  ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { QueryClient } from "@tanstack/react-query";
import axios from "axios";
import logo from "~/assets/logo.png";
import searchIcon from "~/assets/search.svg";
import userIcon from "~/assets/user.svg";
import { CustomerStoreResponse, Store } from "~/hooks/types";
import { useCustomerData } from "~/hooks/useCustomerData";
import { authenticator } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
}

/* Loader to fetch the API url from the environment and pass it to the frontend */
export async function loader({ request }: LoaderFunctionArgs) {
  const queryClient = new QueryClient();
  const response = await queryClient.prefetchQuery({
    queryKey: ["store_list"],
    queryFn: async (): Promise<CustomerStoreResponse> => {
      const response = await axios.get("customer/list-stores");
      return response.data;
    },
  });

  return json({
    isAuthenticated: (await authenticator.isAuthenticated(request))
      ? true
      : false,
  });
}

export default function AppLayout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useLoaderData<typeof loader>();

  const query = useCustomerData();
  const { data, isLoading } = query.fetchAll();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (isLoading) return "Loading";

  return (
    <>
      <div className="px-8">
        <div className="space-x-2 pt-6 flex items-center">
          <Link to="/" className="max-w-[72px] min-w-[72px] aspect-square">
            <img src={logo} alt="logo" />
          </Link>
          <div className="w-full">
            <Form
              id="search-bar"
              action="/sr"
              method="get"
              className="flex overflow-hidden rounded-xl border-2 border-gray-200 focus-within:border-2 focus-within:border-blue-500"
            >
              <select
                className="inline-flex items-center bg-gray-200 py-2.5 px-4 text-gray-600 text-sm border-r-8 max-w-[128px]"
                placeholder="All stores"
                name="store"
              >
                <option value="">All stores</option>
                {data?.stores.map((store: Omit<Store, "balance">) => (
                  <option key={store.storeId} value={store.storeName}>
                    {store.storeName}
                  </option>
                ))}
              </select>
              <input
                className="flex-1 text-sm pl-3 outline-0"
                placeholder="Search for computers"
                name="query"
              />
              <button className="flex mx-4 pt-2.5" type="submit">
                <img src={searchIcon} alt="search icon" />
              </button>
            </Form>
          </div>
          {isAuthenticated && (
            <Link
              to="/owner"
              className="border-2 rounded-xl px-4 h-[44px] border-gray-200 flex justify-center items-center"
            >
              <img src={userIcon} alt="user icon" className="w-8" />
            </Link>
          )}
          <button
            className="rounded-xl px-4 min-w-[96px] text-center bg-[#48576B] text-white text-sm h-[44px]"
            onClick={() => navigate("/auth/callback")}
          >
            {isAuthenticated ? "Log Out" : "Log In"}
          </button>
        </div>
        <Outlet />
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
