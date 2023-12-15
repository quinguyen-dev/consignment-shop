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

  if (query.isLoading) return <div>Loading</div>;

  return (
    <div className="mx-4 mt-8 h-screen">
      {!query.data ? (
        <button
          className="w-full bg-green-500 py-2 "
          onClick={() => navigate("/register")}
        >
          Create store
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{query.data?.storeName}</h1>
            <label className="self-b">
              Store inventory value:{" "}
              <span className="font-bold text-green-600">
                {/* ${query.data.inventoryValue.toFixed(2) ?? 0} */}
              </span>
            </label>
          </div>
          <Link
            to="/inventory"
            className="flex flex-col w-fit border px-4 pt-3 pb-4 rounded-md"
          >
            <h3 className="font-medium">Manage Store Inventory</h3>
            <p className="text-xs">
              Add computers, edit product information, or remove a listing.
            </p>
          </Link>
        </>
      )}
    </div>
  );
}
