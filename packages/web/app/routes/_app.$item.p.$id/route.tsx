import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import placeholderIcon from "~/assets/placeholder.svg";
import { ItemCard, StoreCard } from "~/components";
import { ComputerResultResponse, Store } from "~/hooks/types";
import { useCustomerData } from "~/hooks/useCustomerData";

export async function loader({ params }: LoaderFunctionArgs) {
  return { deviceName: params.item, deviceId: params.id };
}

export default function ItemPage() {
  const data = useLoaderData<typeof loader>();
  const customerInfo = useCustomerData();

  const { data: query, isLoading: carouselIsLoading } =
    customerInfo.fetchHomePageData();

  const { data: device, isLoading } = customerInfo.fetchDevice(data.deviceId!);

  if (isLoading && carouselIsLoading) return "Loading";

  return (
    <>
      <div className="flex space-x-12 py-6 px-12">
        <div className="w-[566px] aspect-square flex justify-center items-center rounded-lg bg-gray-200 mb-4">
          <img src={placeholderIcon} alt="product image" />
        </div>
        <div className="w-full">
          <h1 className="text-2xl font-bold">{device?.deviceName}</h1>
          <h2 className="text-gray-400">{device?.storeName}</h2>
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
