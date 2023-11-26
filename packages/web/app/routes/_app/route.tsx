import { MetaFunction, Outlet } from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import Modal from "react-modal";
import { NavigationBar } from "~/components";

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
  "https://saqb4rb5je.execute-api.us-east-2.amazonaws.com/Initial";
Modal.setAppElement("#root");

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
    <QueryClientProvider client={queryClient}>
      <NavigationBar />
      <Outlet />
    </QueryClientProvider>
  );
}
