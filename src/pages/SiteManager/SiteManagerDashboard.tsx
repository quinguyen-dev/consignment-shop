import placeholder from "@/assets/placeholder.png";
import { NavigationCard } from "@/components";
import { useSiteManagerData } from "@/hooks/useSiteManagerData.ts";
import {useState} from "react";
import StoresDataTable from "@/pages/SiteManager/StoresDataTable.tsx";

function SiteManagerDashboard() {
  const [manageMode, setManageMode] = useState(false);

  const managerData = useSiteManagerData();
  const query = managerData.fetchAll();

  return (
    <div className="mt-8 mx-4">
      <h1 className="font-semibold text-2xl">Welcome back, Site Manager!</h1>
      <hr className="my-4" />
      <div className="flex flex-row space-x-10">
        <div className="flex flex-col space-y-5 w-[330px]">
          <div className="grid gap-x-6 gap-y-4 whitespace-nowrap">
            <label className="font-semibold text-base col-start-1 self-center">
              Your current balance:
            </label>
            <label className="font-semibold text-xl text-green-600 col-start-2">
              {query.data
                ? `$${query.data.managerBalance.toLocaleString()}`
                : `Loading....`}
            </label>

            <label className="font-semibold text-base col-start-1 row-start-2 self-center">
              Inventory Value:
            </label>
            <label className="font-semibold text-xl text-green-600 col-start-2 row-start-2">
              {query.data
                ? `$${query.data.totalBalance.toLocaleString()}`
                : `Loading....`}
            </label>
          </div>

          <NavigationCard
            onClick={() => {
              setManageMode(false);
            }}
            image={placeholder}
            headerText={"Manage Stores"}
            descriptionText={"Take a look at all stores active on the site."}
            selected={!manageMode}
          />

          <NavigationCard
            onClick={() => {setManageMode(true)}}
            image={placeholder}
            headerText={"Manage Change Account Information"}
            descriptionText={"Modify password, change email, etc."}
            selected={manageMode}
          />
        </div>
        {!manageMode && <div className="flex-grow"><StoresDataTable/></div>}
      </div>
    </div>
  );
}

export default SiteManagerDashboard;
