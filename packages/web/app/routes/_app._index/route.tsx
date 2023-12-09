import { ActionFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import axios from "axios";
import { CustomerStoreResponse } from "~/hooks/types";
import { useCustomerData } from "~/hooks/useCustomerData";
import { authenticator, setRedirectUrl } from "~/services/auth.server";

/* Action function to log the user in/out */
export async function action({ request }: ActionFunctionArgs) {
  /* If the user is authenticated, log them out */
  if (await authenticator.isAuthenticated(request)) {
    return await authenticator.logout(request, {
      redirectTo: "/",
    });
  } else {
    /* Update URL to work with auth */
    const url = new URL(request.url);
    setRedirectUrl(url.origin + "/");

    /* Trigger authentication flow */
    return await authenticator.authenticate("oauth2", request, {
      successRedirect: "/inventory",
      failureRedirect: "/",
    });
  }
}

/* Fetch on server side and store in cache */
export async function loader() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["store_list"],
    queryFn: async (): Promise<CustomerStoreResponse> => {
      const response = await axios.get("customer/list-stores");
      return response.data;
    },
  });

  return json({ dehydratedState: dehydrate(queryClient) });
}

export default function AppIndex() {
  const { dehydratedState } = useLoaderData<typeof loader>();

  /* Get all information */
  const customerData = useCustomerData();
  const { data: site } = customerData.fetchAll();

  return (
    <div className="mt-4 px-2">
      <h1 className="text-2xl font-bold">Stores</h1>
      <HydrationBoundary state={dehydratedState}>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {site?.stores.map((store) => (
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
