import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import logo from "~/assets/logo.png";
import { useCustomerData } from "~/hooks/useCustomerData";
import { loader } from "./route";

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
            <form
              id="search-bar"
              action=""
              className="flex overflow-hidden rounded-xl border-2 border-gray-200 focus-within:border-2 focus-within:border-blue-500"
            >
              <select
                className="inline-flex items-center bg-gray-200 py-2.5 px-4 text-gray-600 text-sm border-r-8"
                placeholder="All stores"
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
              />
            </form>
          </div>
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
