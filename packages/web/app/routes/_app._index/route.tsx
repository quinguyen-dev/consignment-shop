import { QueryClient, dehydrate } from "@tanstack/react-query";
import axios from "axios";
import { CustomerStoreResponse } from "~/hooks/types";

import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
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

// Check if the user is authenticated, get their details if so
export async function loader({ request }: LoaderFunctionArgs) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["stores"],
    queryFn: async (): Promise<CustomerStoreResponse> => {
      const response = await axios.get("customer/list-stores");
      return response.data;
    },
  });

  // Turn the auth state into a boolean (so that we don't pass a token around when we don't need it)
  return json({ dehydratedState: dehydrate(queryClient) });
}

export default function AppIndex() {
  const { dehydratedState } = useLoaderData<typeof loader>();
  const store = useCustomerData();
  const query = store.fetchAll();

  return (
    <div className="py-4">
      <div className="flex justify-center items-center flex-col bg-gray-100 h-[384px] rounded-lg">
        <h1 className="text-3xl font-bold">Welcome to NewerEgg</h1>
        <p>The best place for your computer needs.</p>
        <button className="py-2 px-4 rounded-md mt-2 bg-blue-400 text-white">
          Shop Now
        </button>
        {/* <HydrationBoundary state={dehydratedState}>
        <div className="grid grid-cols-4 gap-4 mt-4">
        {query.data?.stores.map((store) => (
          <Link
          key={`${store.storeId}`}
          to={`/store/${store.storeName}`}
          className="border-2 border-gray-200 p-4"
          >
          <h1>{store.storeName}</h1>
          </Link>
          ))}
          </div>
        </HydrationBoundary> */}
      </div>
      <hr className="my-6" />
      <section>
        <h1 className="text-2xl font-bold">Featured products</h1>
        <div className="pt-3 items-start flex">
          <div className="border p-4 rounded-xl">
            <div className="w-[200px] aspect-square flex justify-center items-center rounded-lg bg-gray-200 mb-4 ">
              <img src={placeholderIcon} alt="product image" />
            </div>
            <h2 className="text-lg font-bold">Product name</h2>
            <p className="text-sm text-gray-500">
              Sold by:{" "}
              <Link to="/" className="hover:underline">
                This is somethign
              </Link>
            </p>
            <p className="text-md font-medium">$999.99</p>
          </div>
        </div>
      </section>
      <section className="mt-12">
        <h1 className="text-2xl font-bold">Featured stores</h1>
        <div className="pt-3 items-start flex">
          <div className="border px-4 py-4 min-w-[386px] flex space-x-3 rounded-lg">
            <div className="w-[64px] aspect-square flex justify-center items-center rounded-lg bg-gray-200">
              <img src={placeholderIcon} alt="product image" />
            </div>
            <div>
              <h2 className="font-bold">Store name</h2>
              <p className="text-sm text-gray-500">
                Computers in stock: <span>4</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
