import placeholder from "@/assets/placeholder.png";
import { NavigationCard } from "@/components";
import { useSiteManagerData } from "@/hooks/useSiteManagerData.ts";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Store } from "@/hooks/types.ts";
import dataIcon from "@/assets/data.svg";
import trashIcon from "@/assets/trash.svg";

function SiteManagerDashboard() {
  const [manageMode, setManageMode] = useState(false);

  const managerData = useSiteManagerData();
  const query = managerData.fetchAll();

  const columns = useMemo(() => {
    const helper = createColumnHelper<Store>();
    return [
      helper.accessor("storeId", { header: "#" }),
      helper.accessor("storeName", { header: "Store Name" }),
      helper.accessor(
        (item) => {
          return `$${item.balance.toLocaleString()}`;
        },
        { header: "Balance" }
      ),
      helper.display({
        header: "",
        id: "viewDataColumn",
        cell: (_) => (
          <button>
            <img src={dataIcon} alt="View Data"></img>
          </button>
        ),
      }),
      helper.display({
        header: "",
        id: "trashColumn",
        cell: (props) => (
          <button
            onClick={() => {
              managerData.remove(props.getValue<Store>().storeId);
            }}
          >
            <img src={trashIcon} alt="Delete Store"></img>
          </button>
        ),
      }),
    ];
  }, []);

  const table = useReactTable({
    data: query.data?.stores ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
            onClick={() => {
              setManageMode(true);
            }}
            image={placeholder}
            headerText={"Manage Change Account Information"}
            descriptionText={"Modify password, change email, etc."}
            selected={manageMode}
          />
        </div>
        {!manageMode && (
          <table className="mt-4 flex-grow">
            <thead>
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id} className="border-b-2">
                  {group.headers.map((header) => (
                    <th
                      key={header.id}
                      className="py-2 px-4 text-sm font-bold text-gray-900 text-left"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SiteManagerDashboard;
