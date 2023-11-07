export function SiteManagerDashboard() {
  return (
    <div className="mt-8 mx-4">
      <h1 className="font-bold text-2xl">Welcome back, Site Manager!</h1>
      <hr className="my-4" />
      <div className="flex flex-row space-x-10">
        <div className="grid gap-x-6 gap-y-4">
          <label className="font-bold text-base col-start-1 self-center">
            Your current balance:
          </label>
          <label className="font-bold text-xl text-green-600 col-start-2">
            {"$4242.43"}
          </label>

          <label className="font-bold text-base col-start-1 row-start-2 self-center">
            Inventory Value:
          </label>
          <label className="font-bold text-xl text-green-600 col-start-2 row-start-2">
            {"$123,313.34"}
          </label>
        </div>
      </div>
    </div>
  );
}
