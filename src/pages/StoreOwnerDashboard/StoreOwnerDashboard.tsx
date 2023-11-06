import { Link } from "react-router-dom";

export function StoreOwnerDashboard() {
  return (
    <div className="mt-8 mx-4">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">Manage Consignment Store #1</h1>
        <label className="self-b">
          Your current balance:{" "}
          <span className="text-green-600 font-bold">$1424.25</span>
        </label>
      </div>
      <hr className="my-4" />
      <div className="grid grid-cols-3 gap-x-4">
        <Link
          to="/account/inventory"
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
    </div>
  );
}
