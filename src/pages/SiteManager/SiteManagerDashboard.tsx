import placeholder from "@/assets/placeholder.png";
import {NavigationCard} from "@/components";
import {useSiteManagerData} from "@/hooks/useSiteManagerData.ts";

function SiteManagerDashboard() {
  const managerData = useSiteManagerData();
  const query = managerData.fetchAll();

  return (
    <div className="mt-8 mx-4">
      <h1 className="font-semibold text-2xl">Welcome back, Site Manager!</h1>
      <hr className="my-4" />
      <div className="flex flex-row space-x-10 w-[330px]">
        <div className="flex flex-col space-y-5">
          <div className="grid gap-x-6 gap-y-4 whitespace-nowrap">
            <label className="font-semibold text-base col-start-1 self-center">
              Your current balance:
            </label>
            <label className="font-semibold text-xl text-green-600 col-start-2">
              ${query.data?  query.data.managerBalance.toLocaleString() : "9999.99"}
            </label>

            <label className="font-semibold text-base col-start-1 row-start-2 self-center">
              Inventory Value:
            </label>
            <label className="font-semibold text-xl text-green-600 col-start-2 row-start-2">
              ${query.data?  query.data.totalBalance.toLocaleString() : "9999.99"}
            </label>
          </div>


          <NavigationCard onClick={() => {}} image={placeholder} headerText={"Manage Stores"}
                          descriptionText={"Take a look at all stores active on the site."}/>

          <NavigationCard onClick={() => {}} image={placeholder} headerText={"Manage Change Account Information"}
                          descriptionText={"Modify password, change email, etc."}/>
        </div>
      </div>
    </div>
  );
}

export default SiteManagerDashboard;
