import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
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
      helper.accessor("balance", { header: "Store Balance" }),
      helper.accessor("inventoryValue", { header: "Inventory Value" }),
      helper.accessor("deviceCount", { header: "Device Count" }),
    ];
  }, []);

  const defaultValue = useMemo(() => [], []);

  const table = useReactTable({
    data: query.data?.storeBalances ?? defaultValue,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="mt-4">
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id} className="border-b-2">
            {group.headers.map((header) => (
              <th
                key={header.id}
                className="px-4 py-2 text-left text-sm font-bold text-gray-900"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-b-[1px]">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-4 py-2">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
