import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import axios from "axios";
import { useState } from "react";
import placeholderIcon from "~/assets/placeholder.svg";
import { ItemCard, StoreCard } from "~/components";
import { ComputerResultResponse, Store } from "~/hooks/types";
import { useCustomerData } from "~/hooks/useCustomerData";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const storeId = body.get("storeId");
  const deviceId = body.get("deviceId");
  const longitude = body.get("longitude");
  const latitude = body.get("latitude");

  const response = await axios.post(
    `customer/buy-device?deviceId=${deviceId}&custLatitude=${latitude}&custLongitude=${longitude}&storeId=${storeId}`,
  );

  return redirect("/sr?storeId=&query=");
}

export async function loader({ params }: LoaderFunctionArgs) {
  return { deviceName: params.item, deviceId: params.id };
}

export default function ItemPage() {
  const data = useLoaderData<typeof loader>();
  const customerInfo = useCustomerData();
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const { data: query, isLoading: carouselIsLoading } =
    customerInfo.fetchHomePageData();

  const { data: device, isLoading } = customerInfo.fetchDevice(data.deviceId!);

  if ((isLoading && carouselIsLoading) || device == null) return "Loading";

  const onChangeLatitude = (e: React.FormEvent<HTMLInputElement>) =>
    setLatitude(e.currentTarget.value);

  const onChangeLongitude = (e: React.FormEvent<HTMLInputElement>) =>
    setLongitude(e.currentTarget.value);

  return (
    <>
      <div className="flex space-x-12 py-6 w-full px-4">
        <div className="w-[700px] aspect-square flex justify-center items-center rounded-lg bg-gray-200 mb-4">
          <img src={placeholderIcon} alt="product image" />
        </div>
        <div className="w-full">
          <h1 className="text-2xl font-bold">{device.deviceName}</h1>
          <h2 className="text-gray-400">{device.storeName}</h2>
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
              <p>{device.formFactor} </p>
              <p>{device.processorManufacturer}</p>
              <p>{device.processorModel}</p>
              <p>{device.memoryType}</p>
              <p>{device.memoryMb}</p>
              <p>{device.storageType}</p>
              <p>{device.storageGb}</p>
              <p>{device.gpuManufacturer}</p>
              <p>{device.gpuModel}</p>
              <p>{device.operatingSystem}</p>
            </div>
          </div>
        </div>
        <div className="border rounded-md w-[448px] p-5 flex-col">
          <p className="font-medium text-2xl">${device.price}</p>
          <p className="text-sm font-medium mt-2">
            Enter the following information to purchase the device
          </p>
          <Form method="post" className="text-sm space-y-2 mt-2">
            <input type="hidden" name="deviceId" value={device.deviceId} />
            <input type="hidden" name="storeId" value={device.storeId} />
            <input
              className="border p-1.5 w-full"
              type="text"
              name="longitude"
              placeholder="Longitude"
              onChange={(e) => onChangeLongitude(e)}
            />
            <input
              className="border p-1.5 w-full"
              type="text"
              name="latitude"
              placeholder="Latitude"
              onChange={(e) => onChangeLatitude(e)}
            />
            <button
              className={`w-full p-2 bg-blue-500 text-white rounded-md ${
                longitude !== "" && latitude !== ""
                  ? "opacity-100"
                  : "opacity-50"
              }`}
              type="submit"
              disabled={longitude === "" && latitude === ""}
            >
              Purchase
            </button>
          </Form>
        </div>
      </div>
      <section className="mt-6">
        <h1 className="text-xl font-bold">Find more items like these</h1>
        <div className="pt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
          {query?.selecDevices.map((computer: ComputerResultResponse) => (
            <ItemCard computer={computer} variant="md" />
          ))}
        </div>
      </section>
      <section className="my-6">
        <h1 className="text-xl font-bold">Shop at more stores</h1>
        <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-4 h-fit">
          {query?.selecStores.map((store: Omit<Store, "balance">) => (
            <StoreCard store={store} variant="sm" />
          ))}
        </div>
      </section>
    </>
  );
}
