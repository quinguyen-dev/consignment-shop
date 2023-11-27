import { Link, useNavigate } from "react-router-dom";
import { useStoreOwnerData } from "~/hooks/useStoreOwnerData";

export default function StoreOwnerDashboard() {
  const navigate = useNavigate();
  const ownerData = useStoreOwnerData();
  const query = ownerData.fetchAll();

  if (query.isLoading) return <div>Loading</div>;

  return (
    <div className="mx-4 mt-8">
      {!query.data ? (
        <button
          className="w-full bg-green-500 py-2 "
          onClick={() => navigate("/register")}
        >
          Create store
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              Manage {query.data?.storeName}
            </h1>
            <label className="self-b">
              Your current balance:{" "}
              <span className="font-bold text-green-600">
                ${query.data?.totalBalance.toFixed(2) ?? 0}
              </span>
            </label>
          </div>
          <hr className="my-4" />
          <div className="grid grid-cols-3 gap-x-4">
            <Link
              to="/inventory"
              className="flex min-h-[90px] flex-col border p-4"
            >
              <h2 className="font-bold">Manage Store Inventory</h2>
              <p className="text-sm">
                Add computers, edit product information, or remove a listing.
              </p>
            </Link>
            <Link to="" className="flex min-h-[90px] flex-col border p-4">
              <h2 className="font-bold">View Sell History</h2>
              <p className="text-sm">Take a look at your sell history.</p>
            </Link>
            <Link to="" className="flex min-h-[90px] flex-col border p-4">
              <h2 className="font-bold">Account Change Information</h2>
              <p className="text-sm">Modify password, change email, etc.</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
