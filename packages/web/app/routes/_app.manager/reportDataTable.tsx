import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {createColumnHelper, SortingState} from "@tanstack/react-table";
import {useMemo, useState} from "react";
import { TableView } from "~/components";
import { StoreReport } from "~/hooks/types";
import { useSiteManagerData } from "~/hooks/useSiteManagerData";
import { authenticator } from "~/services/auth.server";

// Loader to fetch the JSON token
export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
}

export default function ReportDataTable() {
  const loaderData = useLoaderData<typeof loader>();
  const store = useSiteManagerData(loaderData.token);
  const query = store.fetchReport();

  const [filteringType, setFilteringType] = useState<"default" | "asc" | "dsc">("default");

  const filteringState = useMemo<SortingState>(() => {
    if (filteringType == "default") {
      return [];
    } else {
      return [{
        id: "Inventory Value",
        desc: filteringType == "dsc"
      }]
    }
  }, [filteringType])

  const columns = useMemo(() => {
    const helper = createColumnHelper<StoreReport>();
    return [
      helper.accessor("storeName", { header: "Store Name" }),
      helper.accessor(
        (item) => {
          return `$${item.balance.toLocaleString()}`;
        },
        { header: "Store Balance" },
      ),
      helper.accessor(
        (item) => {
          return `$${item.inventoryValue.toLocaleString()}`;
        },
        { header: "Inventory Value"
        },
      ),
      helper.accessor("deviceCount", { header: "Device Count" }),
    ];
  }, []);

  return <div>
    <select id="inventory-value-sort" value={filteringType} onChange={(e) =>
        setFilteringType(e.target.value as "default" | "asc" | "dsc")}
            className="inline-flex items-center bg-gray-200 py-2.5 px-4 text-gray-600 text-sm border-8 rounded-md">
      <option disabled value="default">Sort by Inventory Value</option>
      <option value="asc">Low to High</option>
      <option value="dsc">High to Low</option>
    </select>
    <TableView data={query.data?.storeBalances ?? []} columns={columns} sortingState={filteringState} />
  </div>;
}
