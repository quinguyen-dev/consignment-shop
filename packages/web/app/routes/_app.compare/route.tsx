import { useSearchParams } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import placeholderIcon from "~/assets/placeholder.svg";
import { ItemCard, StoreCard } from "~/components";
import { Computer, ComputerResultResponse, Store } from "~/hooks/types";
import { useCustomerData } from "~/hooks/useCustomerData";

export default function Compare() {
  // const { dehydratedState } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const ids = searchParams.get("list")?.split(",") ?? [];

  const { data, isLoading } = useQuery({
    queryKey: [`${ids}`],
    queryFn: async (): Promise<Computer[]> => {
      const computers: Computer[] = [];
      const response = await axios
        .all(
          ids.map((id: string) => axios.get(`customer/device?deviceId=${id}`)),
        )
        .then(
          axios.spread(function (...res) {
            res.forEach((data) => computers.push(data.data));
          }),
        );

      return computers;
    },
  });

  const customerInfo = useCustomerData();
  const { data: query, isLoading: carouselIsLoading } =
    customerInfo.fetchHomePageData();

  if (isLoading || carouselIsLoading) return "Loading";

  return (
    <>
      <h1 className="text-2xl font-bold text-center my-2">
        Comparing {data?.length} devices
      </h1>
      <div className="w-full flex justify-center">
        <div className="flex lg:space-x-4 space-y-4 lg:space-y-0 h-full mt-2 lg:flex-row flex-col">
          {data?.map((computer) => (
            <div className="p-4 px-12 h-fit w-[600px] flex items-center flex-col border">
              <div className="w-[256px] aspect-square flex justify-center items-center rounded-lg bg-gray-200 mb-4 self-center">
                <img src={placeholderIcon} alt="product image" />
              </div>
              <h1 className="font-bold text-lg text-center">
                {computer.deviceName}
              </h1>
              <h2 className="font-medium text-lg mb-4 text-center">
                ${computer.price}
              </h2>
              <div className="flex space-x-12 text-gray-400">
                <div className="w-fit font-medium">
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
                <div className="w-fit">
                  <p>{computer.formFactor} </p>
                  <p>{computer.processorManufacturer}</p>
                  <p>{computer.processorModel}</p>
                  <p>{computer.memoryType}</p>
                  <p>{computer.memoryMb}</p>
                  <p>{computer.storageType}</p>
                  <p>{computer.storageGb}</p>
                  <p>{computer.gpuManufacturer}</p>
                  <p>{computer.gpuModel}</p>
                  <p>{computer.operatingSystem}</p>
                </div>
              </div>
            </div>
          ))}
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
