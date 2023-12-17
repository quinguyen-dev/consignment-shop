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
import Modal from "react-modal";


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
  const { mutate: modifyPrice } = storeInfo.modifyPrice();


  /* Modal state setup */
  const [addModal, setAddModal] = useState(false);

  const [priceChangeComputer, setPriceChangeComputer] = useState<Computer | null>(null);
  const [priceChangePrice, setPriceChangePrice] = useState(0);

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
        id: "updateColumn",
        cell: (props) => (
          <button onClick={() => {
            setPriceChangeComputer(props.row.original);
            setPriceChangePrice(props.row.original.price);
          }} className="border border-black">
            Change Price
          </button>
        )
      }),
      helper.display({
        header: "",
        id: "trashColumn",
        cell: (props) => (
            <button onClick={() => remove(props.row.original.deviceId)} className="border border-black">
              Delete Computer
            </button>
        ),
      }),
    ];
  }, []);

  /* Submit action for computer */
  const onSubmit: SubmitHandler<Computer> = async (data: Computer) => {
    console.log(data);
    data = {
      ...data,
      price: data.price as number,
      storeId: store?.storeId!,
      formFactor: "N/A",
      gpuManufacturer: "N/A",
      memoryType: "N/A",
      storageType: "N/A",
      operatingSystem: "N/A",
      dedicatedGpu: false,
      listingActive: true,
    } satisfies Computer; // todo fix this

    console.log(data);
    create(data);
    setAddModal(false);
  };

  return (
    <>
    <Modal
        isOpen={priceChangeComputer != null}
        onRequestClose={() => {
          setPriceChangeComputer(null);
        }}
        contentLabel={`Change ${priceChangeComputer?.deviceName} Price?`}
        onAfterClose={() => setPriceChangePrice(0)}
        className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"
        overlayClassName="fixed top-0 bottom-0 left-0 right-0 bg-black/50"
      >
        <div className="flex w-min flex-col space-y-2.5 rounded-lg bg-white p-6">
          <h1 className="text-xl font-bold text-black">
            Update Price
          </h1>
          <label className="text-xl text-black">
            Set the new price for {" "}
            <span className="font-bold">{priceChangeComputer?.deviceName}</span>
          </label>
          <input type="number"
            onChange={(event) => setPriceChangePrice(parseFloat(event.target.value))}
            placeholder={`${priceChangeComputer?.price.toLocaleString() ?? ""}`}
            className="w-full rounded-md p-3 text-gray-600 outline outline-1 outline-gray-600"
          />
          <div className="flex flex-row space-x-2 self-end">
            <button
              onClick={() => setPriceChangeComputer(null)}
              className="rounded-md p-3 bg-red-500 text-white outline outline-1 outline-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setPriceChangeComputer(null);
                modifyPrice({deviceId: priceChangeComputer!.deviceId, newPrice: priceChangePrice},)
              }}
              className="rounded-md bg-green-500 p-3 text-white disabled:opacity-50"
            >
              Update Price
            </button>
          </div>
        </div>
      </Modal>
      <div className="mx-4 mt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Inventory Manager{" "}
            <span className="text-gray-400 font-normal">
              ({store?.storeName})
            </span>
          </h1>
          <label className="self-b">
            Inventory Balance:{" "}
            <span className="font-bold text-green-600">
              ${store?.totalInventoryValue.toFixed(2) ?? 0}
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
              className="rounded-lg bg-[#545F71] px-4 text-sm py-2 text-white"
              onClick={() => setAddModal(true)}
            >
              Add new listing
            </button>
            <TableView data={store?.devices ?? []} columns={columns} />
          </div>
        )}
      </div>
    </>
  );
} // todo fix the ?? []
