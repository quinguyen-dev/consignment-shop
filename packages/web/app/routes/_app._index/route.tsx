// export const meta: MetaFunction = () => {
//   return [
//     { title: "Computer Consignment Shop" },
//     {
//       name: "description",
//       content: "Welcome to our computer consignment shop!",
//     },
//   ];
// };

import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, Form } from "@remix-run/react";
import { authenticator, setRedirectUrl } from "~/services/auth.server";

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
  // Turn the auth state into a boolean (so that we don't pass a token around when we don't need it)
  return json({isAuthenticated: await authenticator.isAuthenticated(request) ? true: false});
};

export default function AppIndex() {
  const user = useLoaderData<typeof loader>();
  
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
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
      {user.isAuthenticated && (
        <Link
          to="/account"
          className="flex items-center rounded-md border-2 px-4 text-center"
        >
          Account
        </Link>
      )}
      <Form method="post" className="flex items-center rounded-md border-2 px-4 text-center">
        <button type="submit">{user.isAuthenticated ? "Log Out": "Log In"}</button>
      </Form>
    </div>
      This is the landing pagess
    </div>
  );
}
