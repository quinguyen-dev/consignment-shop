import { ComputerResultResponse, Store } from "~/hooks/types";

import { ActionFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { ItemCard, StoreCard } from "~/components";
import { useCustomerData } from "~/hooks/useCustomerData";
import { authenticator, setRedirectUrl } from "~/services/auth.server";

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

export default function AppIndex() {
  const customerInfo = useCustomerData();
  const { data: query, isLoading } = customerInfo.fetchHomePageData();

  if (isLoading) return "Loading";

  return (
    <div className="py-4">
      <div className="flex justify-center items-center flex-col bg-gray-100 h-[384px] rounded-lg">
        <h1 className="text-3xl font-bold">Welcome to NewerEgg</h1>
        <p>The best place for your computer needs.</p>
        <Link
          to="/sr?store=&query="
          className="py-2 px-4 rounded-md mt-2 bg-blue-400 text-white"
        >
          Shop Now
        </Link>
      </div>
      <hr className="my-6" />
      <section>
        <h1 className="text-2xl font-bold">Featured products</h1>
        <div className="pt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
          {query?.selecDevices.map((computer: ComputerResultResponse) => (
            <ItemCard computer={computer} />
          ))}
        </div>
      </section>
      <section className="mt-12">
        <h1 className="text-2xl font-bold">Featured stores</h1>
        <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-4 h-fit">
          {query?.selecStores.map((store: Omit<Store, "balance">) => (
            <StoreCard store={store} />
          ))}
        </div>
      </section>
    </div>
  );
}
