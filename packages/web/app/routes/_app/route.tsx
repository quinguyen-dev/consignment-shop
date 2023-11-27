import { LoaderFunctionArgs, json } from "@remix-run/node";
import { MetaFunction, Outlet } from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

// Loader to fetch the API url from the environment and pass it to the frontend
export async function loader({ request }: LoaderFunctionArgs) {
  return json({apiBaseUrl: process.env.API_BASE_URL});
};

export const meta: MetaFunction = () => {
  return [
    { title: "Computer Consignment Shop" },
    {
      name: "description",
      content: "Welcome to our computer consignment shop!",
    },
  ];
};

axios.defaults.baseURL =
  "https://vo8vlr6cyc.execute-api.us-east-2.amazonaws.com/dev";

const URL = "https://cs509-newegg.auth.us-east-2.amazoncognito.com";
export default function AppLayout() {
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

  return (
    <div className="p-4">
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </div>
  );
}
