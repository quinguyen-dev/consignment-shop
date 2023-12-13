import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { TableView } from "~/components";
import type { Computer } from "~/hooks/types";
import { useStoreInventory } from "~/hooks/useStoreInventory";
import { authenticator } from "~/services/auth.server";
import { AddComputerForm } from "./AddComputerForm";

/* Determine if the user is authenticated */
export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/", // todo potentially redirect to sign in page
  });
}

/* Inventory Component */
export default function Inventory() {
  /* Determine store information */
  const auth = useLoaderData<typeof loader>();
  const storeInfo = useStoreInventory(auth.token);

  /* Fetch store information and references to create/remove operations */
  const { data: store, isLoading } = storeInfo.fetchStoreInventory();
  const { mutate: create } = storeInfo.create();
  const { mutate: remove } = storeInfo.remove();

  /* Modal state setup */
  const [addModal, setAddModal] = useState(false);

  /* Create columns for table */
  const columns = useMemo<ColumnDef<Computer, any>[]>(() => {
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
      helper.accessor("processorManufacturer", {
        header: "CPU Manufacturer",
      }),
      helper.accessor("processorModel", { header: "CPU Model" }),
      helper.accessor("gpuManufacturer", { header: "GPU Manufacturer" }),
      helper.accessor("gpuModel", { header: "GPU Model" }),
      helper.accessor("dedicatedGpu", { header: "Dedicated" }),
      helper.accessor("operatingSystem", { header: "OS" }),
      helper.display({
        header: "",
        id: "trashColumn",
        cell: (props) => (
          <button onClick={() => remove(props.row.original.deviceId)}>
            Delete
          </button>
        ),
      }),
    ];
  }, []);

  /* Submit action for computer */
  const onSubmit: SubmitHandler<Computer> = async (data: Computer) => {
    data = {
      ...data,
      storeId: store?.storeId!,
      formFactor: "N/A",
      processorManufacturer: "N/A",
      memoryType: "N/A",
      storageType: "N/A",
      operatingSystem: "N/A",
      dedicatedGpu: false,
      listingActive: true,
    } satisfies Computer; // todo fix this

    create(data);
    setAddModal(false);
  };

  return (
    <>
      <div className="mx-4 mt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage {store?.storeName}</h1>
          <label className="self-b">
            Store balance:{" "}
            <span className="font-bold text-green-600">
              ${store?.accountBalance.toFixed(2) ?? 0}
            </span>
          </label>
        </div>
        <hr className="my-4" />
        {isLoading ? (
          <div>Loading...</div>
        ) : addModal ? (
          <AddComputerForm setShowing={setAddModal} onSubmit={onSubmit} />
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
            <TableView data={store?.inventory ?? []} columns={columns} />
          </div>
        )}
      </div>
    </>
  );
} // todo fix the ?? []
