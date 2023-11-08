import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import App from "./App.tsx";
import { AuthProvider, TAuthConfig } from "react-oauth2-code-pkce";
import Modal from "react-modal";

const queryClient: QueryClient = new QueryClient();
axios.defaults.baseURL =
  " https://saqb4rb5je.execute-api.us-east-2.amazonaws.com/Initial";
Modal.setAppElement('#root');

const url = "https://cs509-newegg.auth.us-east-2.amazoncognito.com";

const authConfig: TAuthConfig = {
  clientId: "6ra4r9q3m3nd9v8bkolqiittsk",
  authorizationEndpoint: `${url}/oauth2/authorize`,
  tokenEndpoint: `${url}/oauth2/token`,
  logoutEndpoint: `${url}/logout`,
  extraLogoutParameters: {
    logout_uri: new URL(location.origin).toString(),
  },
  redirectUri: new URL(location.origin).toString(),
  scope: "openid profile email aws.cognito.signin.user.admin",
  autoLogin: false,
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider authConfig={authConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);
