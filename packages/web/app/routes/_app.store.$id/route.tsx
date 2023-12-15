import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useCustomerData } from "~/hooks/useCustomerData";

export async function loader({ params }: LoaderFunctionArgs) {
  return params.id;
}

// todo can get rid of

export default function CustomerStoreView() {
  const data = useLoaderData<typeof loader>();

  const store = useCustomerData();
  const query = store.fetchStoreInfo(data);

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold my-3">
        {query.data?.storeName} Inventory
      </h1>
      <hr className="my-3" />
      <div className="grid grid-cols-3 gap-4">
        {query.data?.devices.map((computer) => (
          <div key={computer.deviceId} className="flex justify-between border-2 border-gray-200 p-4 mb-4">
            <div>
              <h1 className="font-bold text-xl mb-2">{computer.deviceName}</h1>
              <p>
                <span className="font-medium">GPU Model: </span>
                {computer.gpuModel}
              </p>
              <p>
                <span className="font-medium">Processor Model: </span>
                {computer.processorModel}
              </p>
              <p>
                <span className="font-medium">Storage: </span>
                {computer.storageGb} GB
              </p>
              <p>
                <span className="font-medium">Memory: </span>
                {computer.memoryMb} MB
              </p>
            </div>
            <a className="text-xl font-bold text-green-600">
              ${computer.price}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
