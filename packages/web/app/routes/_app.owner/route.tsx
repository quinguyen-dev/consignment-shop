import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { useStoreOwnerData } from "~/hooks/useStoreOwnerData";
import { authenticator } from "~/services/auth.server";

// Loader to fetch the JSON token
export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
}

export default function StoreOwnerDashboard() {
  const navigate = useNavigate();
  const loaderData = useLoaderData<typeof loader>();
  const ownerData = useStoreOwnerData(loaderData.token);
  const query = ownerData.fetchAll();

  if (query.isLoading) return "Loading";

  return (
    <div className="mx-4 mt-6 h-screen">
      {!query.data ? (
        <button
          className="w-full bg-green-500 py-2 "
          onClick={() => navigate("/register")}
        >
          Create store
        </button>
      ) : (
        <>
          <div className="mb-4 flex-col flex">
            <h1 className="text-2xl font-bold">{query.data?.storeName}</h1>
            <div className="flex items-start space-x-8 mt-4 text-sm">
              <div className="flex space-x-4">
                <div className="font-medium flex flex-col w-fit">
                  <label>Store ID:</label>
                  <label>Store Owner ID:</label>
                </div>
                <div className="flex flex-col w-fit text-gray-500">
                  <label>{query.data?.storeId}</label>
                  <label>{query.data?.storeOwnerId} </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="font-medium flex flex-col w-fit">
                  <label>Account balance:</label>
                  <label>Total inventory value:</label>
                </div>
                <div className="flex flex-col w-fit text-gray-500">
                  <label>${query.data?.accountBalance}</label>
                  <label>${query.data?.totalInventoryValue} </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="font-medium flex flex-col w-fit">
                  <label>Longitude:</label>
                  <label>Latitude:</label>
                </div>
                <div className="flex flex-col w-fit text-gray-500">
                  <label>{query.data?.latitude}</label>
                  <label>{query.data?.longitude} </label>
                </div>
              </div>
            </div>
          </div>
          <hr className="my-4" />
          <div className="w-fit space-y-5">
          <Link
            to="/inventory"
            className="flex flex-col w-full border px-4 pt-3 pb-4 rounded-md"
          >
            <h3 className="font-medium">Manage Store Inventory</h3>
            <p className="text-xs">
              Add computers, edit product information, or remove a listing.
            </p>
          </Link>
          {loaderData.username == "sitemanager" && <Link
            to="/manager"
            className="flex flex-col w-fit border px-4 pt-3 pb-4 rounded-md"
          >
            <h3 className="font-medium">View Site Manager Dashboard</h3>
            <p className="text-xs">
              Perform Site Manager functions, such as viewing and managing all stores.
            </p>
          </Link>}
            </div>
        </>
      )}
    </div>
  );
}
