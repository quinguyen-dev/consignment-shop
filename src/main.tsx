import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import App from "./App.tsx";

const queryClient: QueryClient = new QueryClient();
axios.defaults.baseURL =
  " https://saqb4rb5je.execute-api.us-east-2.amazonaws.com/Initial";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
