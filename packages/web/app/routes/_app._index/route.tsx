import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import axios from "axios";
import { CustomerStoreResponse } from "~/hooks/types";
import { useCustomerData } from "~/hooks/useCustomerData";

export async function loader() {
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
  const store = useCustomerData();
  const query = store.fetchAll();

  const { dehydratedState } = useLoaderData<typeof loader>();

  return (
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
  );
}
