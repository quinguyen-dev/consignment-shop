import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { useStoreInventory } from "@/hooks/useStoreInventory";
import type { Computer } from "@/hooks/types";

export function InventoryManager() {
  const store = useStoreInventory();
  const query = store.fetchAll();

  const columns = useMemo(() => {
    const helper = createColumnHelper<Computer>();
    return [
      helper.accessor("deviceId", { header: "ID" }),
      helper.accessor("listingActive", { header: "listed" }),
      helper.accessor("deviceName", { header: "Product Name" }),
      helper.accessor((cell: Computer) => `$${cell.price}`, {
        header: "Price",
      }),
      helper.accessor("formFactor", { header: "Form Factor" }),
      helper.accessor("memoryMb", { header: "Memory" }),
      helper.accessor("memoryType", { header: "Memory Type" }),
      helper.accessor("storageGb", { header: "Storage" }),
      helper.accessor("storageType", { header: "Storage Type" }),
      helper.accessor("processorManufacturer", { header: "CPU Manufacturer" }),
      helper.accessor("processorModel", { header: "CPU Model" }),
      helper.accessor("gpuManufacturer", { header: "GPU Manufacturer" }),
      helper.accessor("gpuModel", { header: "GPU Model" }),
      helper.accessor("dedicatedGpu", { header: "Dedicated" }),
      helper.accessor("operatingSystem", { header: "OS" }),
    ];
  }, []);

  const table = useReactTable({
    data: query.data?.inventory ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (query.isLoading) return <div>Loading</div>;

  return (
    <div className="mt-8 mx-4">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">Manage Consignment Store #1</h1>
        <label className="self-b">
          Store balance:{" "}
          <span className="text-green-600 font-bold">
            ${query.data?.totalBalance.toFixed(2)}
          </span>
        </label>
      </div>
      <hr className="my-4" />
      {query.isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-x-2">
          <button className="bg-[#545F71] text-white px-4 py-2 rounded-md">
            Add new listing
          </button>
          <button className="bg-[#EEF1F4] text-black px-4 py-2 rounded-md">
            Download
          </button>
          <div className="w-full overflow-y-auto">
            <table className="mt-4">
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
