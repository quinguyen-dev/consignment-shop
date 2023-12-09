import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
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
        { header: "Inventory Value" },
      ),
      helper.accessor("deviceCount", { header: "Device Count" }),
    ];
  }, []);

  return <TableView data={query.data?.storeBalances ?? []} columns={columns} />;
}
