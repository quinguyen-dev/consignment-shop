import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import axios from "axios";
import { CustomerStoreResponse } from "~/hooks/types";

import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useCustomerData } from "~/hooks/useCustomerData";
import { authenticator, setRedirectUrl } from "~/services/auth.server";

/* Meta information for index route */
export const meta: MetaFunction = () => {
  return [
    { title: "Computer Consignment Shop" },
    {
      name: "description",
      content: "Welcome to our computer consignment shop!",
    },
  ];
};

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

  return json({ dehydratedState: dehydrate(queryClient) });
}

export default function AppIndex() {
  const { dehydratedState } = useLoaderData<typeof loader>();
  const store = useCustomerData();
  const query = store.fetchAll();

  return (
    <div className="mt-4 px-2">
      <h1 className="text-2xl font-bold">Stores</h1>
      <HydrationBoundary state={dehydratedState}>
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
      </HydrationBoundary>
    </div>
  );
}
