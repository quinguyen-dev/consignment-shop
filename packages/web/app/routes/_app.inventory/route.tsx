import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import type { Computer } from "~/hooks/types";
import { useStoreInventory } from "~/hooks/useStoreInventory";
import { authenticator } from "~/services/auth.server";

// Loader to fetch the JSON token
export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
}

export default function Inventory() {
  const loaderData = useLoaderData<typeof loader>();
  const store = useStoreInventory(loaderData.token);

  const query = store.fetchAll();
  const { mutate: create } = store.create();

  const [addModal, setAddModal] = useState(false);

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

  const defaultValue = useMemo(() => [], []);

  const table = useReactTable({
    data: query.data?.inventory ?? defaultValue,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const onSubmit: SubmitHandler<Computer> = async (data: Computer) => {
    data = {
      ...data,
      storeId: query.data?.storeId ?? "",
      formFactor: "N/A",
      processorManufacturer: "N/A",
      memoryType: "N/A",
      storageType: "N/A",
      operatingSystem: "N/A",
      dedicatedGpu: false,
      listingActive: true,
    } satisfies Computer;

    create(data);
    setAddModal(false);
  };

  return (
    <>
      <div className="mx-4 mt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage {query.data?.storeName}</h1>
          <label className="self-b">
            Store balance:{" "}
            <span className="font-bold text-green-600">
              ${query.data?.totalBalance.toFixed(2) ?? 0}
            </span>
          </label>
        </div>
        <hr className="my-4" />
        {query.isLoading ? (
          <div>Loading...</div>
        ) : addModal ? (
          <AddForm setShowing={setAddModal} onSubmit={onSubmit} />
        ) : (
          <div className="space-x-2">
            <button
              className="rounded-md bg-[#545F71] px-4 py-2 text-white"
              onClick={() => setAddModal(true)}
            >
              Add new listing
            </button>
            <button className="rounded-md bg-[#EEF1F4] px-4 py-2 text-black">
              Download
            </button>
            <div className="z-0 w-full overflow-y-auto">
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
    </>
  );
}

interface AddFormProps {
  setShowing: (value: boolean | ((prevVar: boolean) => boolean)) => void;
  onSubmit: (data: Computer) => void;
}

function AddForm({ setShowing, onSubmit }: AddFormProps) {
  const { register, handleSubmit } = useForm<Computer>();

  return (
    <>
      <h1 className="mb-4 text-xl font-bold">Add a computer</h1>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <input
          className="mb-2 border px-4 py-2"
          placeholder="Product name"
          {...register("deviceName")}
        />
        <input
          className="mb-2 border px-2 py-4"
          placeholder="Price"
          {...register("price")}
        />
        <select
          className="mb-2 border px-4 py-2"
          placeholder="Memory (in MB)"
          {...register("memoryMb")}
        >
          <option value={4000}>4GB</option>
          <option value={8000}>8GB</option>
          <option value={160000}>16GB</option>
          <option value={32000}>32GB</option>
        </select>
        <select
          className="mb-2 border px-4 py-2"
          placeholder="Storage (in GB)"
          {...register("storageGb")}
        >
          <option value={256}>256GB</option>
          <option value={512}>512GB</option>
          <option value={1000}>1TB</option>
          <option value={2000}>2GB</option>
          <option value={4000}>4TB</option>
        </select>
        <input
          className="mb-2 border px-4 py-2"
          placeholder="Processor Model"
          {...register("processorModel")}
        />
        <select
          className="mb-2 border px-4 py-2"
          placeholder="GPU Manufacturer"
          {...register("gpuManufacturer")}
        >
          <option value="Intel">Intel</option>
          <option value="AMD">AMD</option>
          <option value="NVIDIA">NVIDIA</option>
        </select>
        <select
          className="mb-2 border px-4 py-2"
          placeholder="GPU Model"
          {...register("gpuModel")}
        >
          <option value="NVIDIA GeForce RTX 4090">
            NVIDIA GeForce RTX 4090
          </option>
          <option value="NVIDIA GeForce RTX 4080">
            NVIDIA GeForce RTX 4080
          </option>
          <option value="AMD Radeon Pro W6300">AMD Radeon Pro W6300</option>
          <option value="AMD Radeon Pro W6400">AMD Radeon Pro W6400</option>
          <option value="Intel Integrated Graphics">
            Intel Integrated Graphics
          </option>
          <option value="Intel UHD Graphics 730">Intel UHD Graphics 730</option>
          <option value="Intel UHD Graphics 770">Intel UHD Graphics 770</option>
        </select>
        <div className="mt-2 flex space-x-4">
          <button
            className="rounded-md bg-red-600 px-4 py-2 text-white"
            onClick={() => setShowing(false)}
          >
            Cancel
          </button>
          <input
            className="cursor-pointer rounded-md bg-green-600 px-4 py-2 text-white"
            type="submit"
            value="Confirm"
          />
        </div>
      </form>
    </>
  );
}
