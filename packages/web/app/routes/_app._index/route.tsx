import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import axios from "axios";
import { CustomerStoreResponse } from "~/hooks/types";

import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { authenticator, setRedirectUrl } from "~/services/auth.server";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useCustomerData } from "~/hooks/useCustomerData";

// Action function to log the user in/out depending on what you said
export async function action({ request }: ActionFunctionArgs) {
  // If the user is authenticated, log out
  if (await authenticator.isAuthenticated(request)) {
    // Log them out
    return await authenticator.logout(request, {
      redirectTo: "/"
    })
} else {
  const url = new URL(request.url);
   setRedirectUrl(url.origin + "/");
   
  // Otherwise, log in
  const response = await authenticator.authenticate("oauth2", request, {
    successRedirect: "/inventory",
    failureRedirect: "/"
  });
  
  console.error(response);
  return null;
}
};

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
  return json({isAuthenticated: await authenticator.isAuthenticated(request) ? true: false, dehydratedState: dehydrate(queryClient)});
};

export default function AppIndex() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  const store = useCustomerData();
  const query = store.fetchAll();

  const { dehydratedState } = useLoaderData<typeof loader>();
  
  return (
    <div>
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
          to="/account"
          className="flex items-center rounded-md border-2 px-4 text-center"
        >
          Account
        </Link>
      )}
      <Form method="post" className="flex items-center rounded-md border-2 px-4 text-center">
        <button type="submit">{isAuthenticated ? "Log Out": "Log In"}</button>
      </Form>
      </div>

    <div className="mt-4 px-2">
      <h1 className="text-2xl font-bold">Stores</h1>
      <HydrationBoundary state={dehydratedState}>
        <div className="grid grid-rows-3 grid-cols-4 gap-4 mt-4">
          {query.data?.stores.map((store) => (
            <Link
              to={`/store/${store.storeName}`}
              className="border-2 border-gray-200 p-4"
            >
              <h1>{store.storeName}</h1>
            </Link>
          ))}
        </div>
      </HydrationBoundary>
    </div>
    </div>
  
  );
}
