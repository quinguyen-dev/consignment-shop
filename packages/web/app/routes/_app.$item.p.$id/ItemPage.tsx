import { Link, useLoaderData } from "@remix-run/react";
import placeholderIcon from "~/assets/placeholder.svg";
import { ComputerResultResponse, Store } from "~/hooks/types";
import { useCustomerData } from "~/hooks/useCustomerData";
import { loader } from "./route";

export default function ItemPage() {
  const data = useLoaderData<typeof loader>();
  const customerInfo = useCustomerData();
  const { data: device, isLoading } = customerInfo.fetchDevice(
    data.deviceId ?? "",
  );

  const { data: query, isLoading: carouselIsLoading } =
    customerInfo.fetchHomePageData();

  if (isLoading && carouselIsLoading) return "Loading";

  return (
    <>
      <div className="flex space-x-12 py-6 px-12">
        <div className="w-[566px] aspect-square flex justify-center items-center rounded-lg bg-gray-200 mb-4">
          <img src={placeholderIcon} alt="product image" />
        </div>
        <div className="w-full">
          <h1 className="text-2xl font-bold">{device?.deviceName}</h1>
          <h2 className="text-gray-400">Sold by: Store name</h2>
          <hr className="my-2" />
          <div className="flex space-x-12 text-sm">
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
        <div className="border w-[448px] p-4 flex-col space-y-4">
          <p className="font-medium text-2xl">${device?.price}</p>
          <button className="w-full p-2 bg-blue-500 text-white rounded-md">
            Purchase
          </button>
        </div>
      </div>
      <section className="mt-6">
        <h1 className="text-xl font-bold">Find more items like these</h1>
        <div className="pt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
          {query?.selecDevices.map((computer: ComputerResultResponse) => {
            return (
              <div
                key={computer.deviceId}
                className="border p-4 rounded-xl flex flex-col xl:flex-row xl:justify-between"
              >
                <div>
                  <h2 className="font-bold">{computer.deviceName}</h2>
                  <p className="text-xs text-gray-500">
                    Sold by:{" "}
                    <Link
                      to={`/sr?store=${computer.storeName}&query=`}
                      className="hover:underline"
                    >
                      {computer.storeName}
                    </Link>
                  </p>
                </div>
                <p className="text-md font-medium">${computer.price}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="my-6">
        <h1 className="text-xl font-bold">Shop at more stores</h1>
        <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-4 h-fit">
          {query?.selecStores.map((store: Store) => (
            <Link
              to={`/sr?store=${store.storeName}&query=`}
              key={store.storeId}
              className="border px-4 py-4 flex space-x-3 rounded-lg h-full"
            >
              <h2 className="font-bold">{store.storeName}</h2>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
