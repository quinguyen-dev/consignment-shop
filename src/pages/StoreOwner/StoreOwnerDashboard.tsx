import { useStoreOwnerData } from "@/hooks/useStoreOwnerData";
import { Link, useNavigate } from "react-router-dom";

export function StoreOwnerDashboard() {
  const navigate = useNavigate();
  const ownerData = useStoreOwnerData();
  const query = ownerData.fetchAll();

  if (query.isLoading) return <div>Loading</div>;

  return (
    <div className="mt-8 mx-4">
      {!query.data ? (
        <button
          className="bg-green-500 w-full py-2 "
          onClick={() => navigate("/register")}
        >
          Create store
        </button>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-2xl">
              Manage {query.data?.storeName}
            </h1>
            <label className="self-b">
              Your current balance:{" "}
              <span className="text-green-600 font-bold">
                ${query.data?.totalBalance.toFixed(2) ?? 0}
              </span>
            </label>
          </div>
          <hr className="my-4" />
          <div className="grid grid-cols-3 gap-x-4">
            <Link
              to="/inventory"
              className="min-h-[90px] border flex flex-col p-4"
            >
              <h2 className="font-bold">Manage Store Inventory</h2>
              <p className="text-sm">
                Add computers, edit product information, or remove a listing.
              </p>
            </Link>
            <Link to="" className="min-h-[90px] border flex flex-col p-4">
              <h2 className="font-bold">View Sell History</h2>
              <p className="text-sm">Take a look at your sell history.</p>
            </Link>
            <Link to="" className="min-h-[90px] border flex flex-col p-4">
              <h2 className="font-bold">Account Change Information</h2>
              <p className="text-sm">Modify password, change email, etc.</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
