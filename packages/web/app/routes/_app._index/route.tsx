import { ComputerResultResponse, Store } from "~/hooks/types";

import { ActionFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import placeholderIcon from "~/assets/placeholder.svg";
import { useCustomerData } from "~/hooks/useCustomerData";
import { authenticator, setRedirectUrl } from "~/services/auth.server";

// Action function to log the user in/out depending on what you said
export async function action({ request }: ActionFunctionArgs) {
  // If the user is authenticated, log out
  if (await authenticator.isAuthenticated(request)) {
    // Log them out
    return await authenticator.logout(request, {
      redirectTo: "/",
    });
  } else {
    // Update the URL to use with the auth
    const url = new URL(request.url);
    setRedirectUrl(url.origin + "/");

    // Trigger the auth flow
    return await authenticator.authenticate("oauth2", request, {
      successRedirect: "/inventory",
      failureRedirect: "/",
    });
  }
}

export default function AppIndex() {
  const customerInfo = useCustomerData();
  const { data: query, isLoading } = customerInfo.fetchHomePageData();

  if (isLoading) return "Loading";

  return (
    <div className="py-4">
      <div className="flex justify-center items-center flex-col bg-gray-100 h-[384px] rounded-lg">
        <h1 className="text-3xl font-bold">Welcome to NewerEgg</h1>
        <p>The best place for your computer needs.</p>
        <button className="py-2 px-4 rounded-md mt-2 bg-blue-400 text-white">
          Shop Now
        </button>
      </div>
      <hr className="my-6" />
      <section>
        <h1 className="text-2xl font-bold">Featured products</h1>
        <div className="pt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
          {query?.selecDevices.map((computer: ComputerResultResponse) => {
            return (
              <div key={computer.deviceId} className="border p-4 rounded-xl">
                <div className="w-full h-[200px] flex justify-center items-center rounded-lg bg-gray-200 mb-4 ">
                  <img src={placeholderIcon} alt="product image" />
                </div>
                <h2 className="text-lg font-bold">{computer.deviceName}</h2>
                <p className="text-sm text-gray-500">
                  Sold by:{" "}
                  <Link to="/" className="hover:underline">
                    {computer.stores.storeName}
                  </Link>
                </p>
                <p className="text-md font-medium">${computer.price}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="mt-12">
        <h1 className="text-2xl font-bold">Featured stores</h1>
        <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-4 h-fit">
          {query?.selecStores.map((store: Store) => (
            <Link
              to=""
              key={store.storeId}
              className="border px-4 py-4 flex space-x-3 rounded-lg h-full"
            >
              <div className="min-w-[64px] aspect-square flex justify-center items-center rounded-lg bg-gray-200">
                <img src={placeholderIcon} alt="product image" />
              </div>
              <h2 className="font-bold">{store.storeName}</h2>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
