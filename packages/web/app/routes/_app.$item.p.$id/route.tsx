import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import Modal from "react-modal";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import placeholderIcon from "~/assets/placeholder.svg";
import { ItemCard, StoreCard } from "~/components";
import { ComputerResultResponse, EstimatedShippingResponse, Store } from "~/hooks/types";
import { useCustomerData } from "~/hooks/useCustomerData";

export async function loader({ params }: LoaderFunctionArgs) {
  return { deviceName: params.item, deviceId: params.id };
}

export default function ItemPage() {
  const navigate = useNavigate();
  const data = useLoaderData<typeof loader>();
  const customerInfo = useCustomerData();
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const { data: query, isLoading: carouselIsLoading } =
    customerInfo.fetchHomePageData();

  const { data: device, isLoading } = customerInfo.fetchDevice(data.deviceId!);
  const test =customerInfo.fetchDevice(data.deviceId!);

  const { data: fees, isLoading: feesLoading, refetch: updateFees } = customerInfo.getFees(data.deviceId!, parseFloat(latitude), parseFloat(longitude));

  useEffect(() => {updateFees()}, [longitude, latitude])

  const [modalMessage, setModalMessage] = useState("");

  return (
    <>
    <Modal isOpen={modalMessage != ""} className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"
        overlayClassName="fixed top-0 bottom-0 left-0 right-0 bg-black/50">
        <div className="space-y-5 bg-white p-6 rounded-lg">
          <p>{modalMessage}</p>
          <button onClick={() => navigate("/sr")} className="outline">Return to Store</button>
        </div>
    </Modal>
      <div className="flex space-x-12 py-6 w-full px-4">
        <div className="w-[700px] aspect-square flex justify-center items-center rounded-lg bg-gray-200 mb-4">
          <img src={placeholderIcon} alt="product image" />
        </div>
        <div className="w-full">
          <h1 className="text-2xl font-bold">{device?.deviceName}</h1>
          <h2 className="text-gray-400">{device?.storeName}</h2>
          <hr className="my-2" />
          <div className="flex space-x-12">
            <div className="w-fit font-medium text-black">
              <p>Form factor: </p>
              <p>Processor manufacturer: </p>
              <p>Processor model: </p>
              <p>Memory type: </p>
              <p>Memory capacity: </p>
              <p>Storage type: </p>
              <p>Storage capacity: </p>
              <p>GPU manufacturer: </p>
              <p>GPU model: </p>
              <p>Operating system: </p>
            </div>
            <div className="w-fit text-gray-500">
              <p>{device?.formFactor} </p>
              <p>{device?.processorManufacturer}</p>
              <p>{device?.processorModel}</p>
              <p>{device?.memoryType}</p>
              <p>{device?.memoryMb}</p>
              <p>{device?.storageType}</p>
              <p>{device?.storageGb}</p>
              <p>{device?.gpuManufacturer}</p>
              <p>{device?.gpuModel}</p>
              <p>{device?.operatingSystem}</p>
            </div>
          </div>
        </div>
        <div className="border rounded-md w-[448px] p-5 flex-col">
          <p className="font-medium text-2xl">${device?.price}</p>
          <p className="text-sm font-medium mt-2">
            Enter the following information to purchase the device
          </p>
          <div className="text-sm space-y-2 mt-2">
            <input
              className="border p-1.5 w-full"
              type="number"
              name="longitude"
              placeholder="Longitude"
              onChange={(e) => setLongitude(e.target.value)}
            />
            <input
              className="border p-1.5 w-full"
              type="number"
              name="latitude"
              placeholder="Latitude"
              onChange={(e) => setLatitude(e.target.value)}
            />
            <button
              className={`w-full p-2 bg-blue-500 text-white rounded-md ${
                longitude !== "" && latitude !== ""
                  ? "opacity-100"
                  : "opacity-50"
              }`}
              onClick={async () => {
                if (!device) {
                  setModalMessage("Invalid Device ID. The Device may have already been purchased");
                }
                const response = await axios.post(
                  `customer/buy-device?deviceId=${data.deviceId!}&custLatitude=${latitude}&custLongitude=${longitude}&storeId=${device!.storeId}`,
                );
                
                if (response.status == 200) {
                  setModalMessage("Successfully purchased " + device!.deviceName);
                } else {
                  setModalMessage("Failed to purchase " + device!.deviceName + ". The device may no longer be available")
                }
              }}
              disabled={longitude === "" && latitude === ""}
            >
              Purchase
            </button>
          </div>

          <p className="text-sm font-medium mt-2">Estimated Shipping Cost: ${fees?.shippingCost?.toLocaleString() ?? "Loading..."}</p>
        </div>
      </div>
      <section className="mt-6">
        <h1 className="text-xl font-bold">Find more items like these</h1>
        <div className="pt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
          {query?.selecDevices.map((computer: ComputerResultResponse) => (
            <ItemCard key={computer.deviceId} computer={computer} variant="md" />
          ))}
        </div>
      </section>
      <section className="my-6">
        <h1 className="text-xl font-bold">Shop at more stores</h1>
        <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-4 h-fit">
          {query?.selecStores.map((store: Omit<Store, "balance">) => (
            <StoreCard key={store.storeId} store={store} variant="sm" />
          ))}
        </div>
      </section>
    </>
  );
}
