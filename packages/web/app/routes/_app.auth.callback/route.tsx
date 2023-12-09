import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator, setRedirectUrl } from "~/services/auth.server";

// dashboard if it is or return null if it's not
export async function loader({ request }: LoaderFunctionArgs) {
  if (await authenticator.isAuthenticated(request)) {
    return await authenticator.logout(request, {
      redirectTo:
        "https://cs509-dev-2023-fall.auth.us-east-2.amazoncognito.com/logout?" +
        new URLSearchParams({
          client_id: "2t49b07b6dqou0c6ibqpnbjchb",
          logout_uri: new URL(request.url).origin + "/",
        }),
    });
  } else {
    // Update the URL, to lead us back here to complete the auth request
    setRedirectUrl(new URL(request.url).origin + "/auth/callback/");

    // This starts/completes completes the authentication request, returning the user to their dashboard
    return await authenticator.authenticate("oauth2", request, {
      successRedirect: "/manager",
      failureRedirect: "/",
    });
  }
}

export default function AuthCallback() {
  const loaderData = useLoaderData<typeof loader>();
  return <div>{loaderData}</div>;
}
