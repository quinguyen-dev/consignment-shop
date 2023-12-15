import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import placeholder from "~/assets/placeholder.png";
import { NavigationCard } from "~/components";
import { useSiteManagerData } from "~/hooks/useSiteManagerData";
import { authenticator } from "~/services/auth.server";
import ReportDataTable from "./reportDataTable";
import StoresDataTable from "./storeDataTable";

// Loader to fetch the JSON token
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);

  // Validate the user is the site manager
  if (!user) {
    return redirect("/");
  } else if (user.username != "sitemanager") {
    return redirect("/owner");
  } else {
    return user;
  }
}

export default function SiteManagerView() {
  const [manageMode, setManageMode] = useState(false);
  const loaderData = useLoaderData<typeof loader>();

  const managerData = useSiteManagerData(loaderData.token);
  const query = managerData.fetchReport();

  console.log(query.data);

  return (
    <div className="mx-4 mt-8">
      <h1 className="text-2xl font-semibold">Welcome back, Site Manager!</h1>
      <hr className="my-4" />
      <div className="flex flex-row space-x-10">
        <div className="flex min-w-[330px] flex-col space-y-5">
          <div className="grid gap-x-6 gap-y-4 whitespace-nowrap">
            <label className="col-start-1 self-center text-base font-semibold">
              Your current balance:
            </label>
            <label className="col-start-2 text-xl font-semibold text-green-600">
              {query.data
                ? `$${query.data.managersBalance.toLocaleString()}`
                : `Loading....`}
            </label>

            <label className="col-start-1 row-start-2 self-center text-base font-semibold">
              Inventory Value:
            </label>
            <label className="col-start-2 row-start-2 text-xl font-semibold text-green-600">
              {query.data
                ? `$${query.data.totalInventoryValue.toLocaleString()}`
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
            onClick={() => {
              setManageMode(true);
            }}
            image={placeholder}
            headerText={"View report"}
            descriptionText={
              "Look at a report of all stores active on the site."
            }
            selected={manageMode}
          />
        </div>
        {!manageMode ? (
          <div className="flex-grow">
            <StoresDataTable />
          </div>
        ) : (
          <ReportDataTable />
        )}
      </div>
    </div>
  );
}
