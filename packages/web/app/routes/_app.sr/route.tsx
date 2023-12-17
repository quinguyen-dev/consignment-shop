import { Link, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { Computer, ComputerResultResponse } from "~/hooks/types";
import { useCustomerData } from "~/hooks/useCustomerData";
import { ResultPane } from "~/routes/_app.sr/ResultPane";
import { FilterPane } from "./FilterPane";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [
    store,
    query,
    price,
    memoryMb,
    storageGb,
    processorManufacturer,
    processorModel,
    gpuModel,
  ] = [
    searchParams.get("storeName") ?? "",
    searchParams.get("query") ?? "",
    searchParams.get("price") ?? "",
    searchParams.get("memoryMb") ?? "",
    searchParams.get("storageGb") ?? "",
    searchParams.get("processorManufacturer") ?? "",
    searchParams.get("processorModel") ?? "",
    searchParams.get("gpuModel") ?? "",
  ];
  const [compareList, setCompareList] = useState<Computer[]>([]);
  const storeInfo = useCustomerData();
  const { data, isLoading } = storeInfo.fetchStoreInfo({
    storeName: store,
    price: price,
    memoryMb: memoryMb,
    storageGb: storageGb,
    processorManufacturer: processorManufacturer,
    processorModel: processorModel,
    gpuModel: gpuModel,
  });
  function addToCompareList(computer: Computer) {
    const isAlreadySelected = compareList.includes(computer);

    if (isAlreadySelected)
      setCompareList((prev) => [
        ...prev.filter((comp: Computer) => computer.deviceId !== comp.deviceId),
      ]);
    else if (compareList.length < 2)
      setCompareList((prev) => [...prev, computer]);
  }

  if (isLoading) return "Loading";

  return (
    <>
      <div className="p-2">
        <p className="text-xs">
          Showing {data?.devices.length ?? 0} search results for "{query}"
        </p>
      </div>
      <hr />
      <div className="flex mt-4">
        <FilterPane />
        <div className="w-full">
          <div className="flex justify-between items-end">
            <h1 className="text-xl font-bold">
              Results from {store === "" ? "all stores" : `'${store}'`}
            </h1>
            <Link
              className={`px-4 py-2 rounded-xl text-sm bg-blue-500 text-white ${
                compareList.length === 2 ? "opacity-100" : "opacity-50"
              }`}
              to={`/compare?list=${compareList.at(0)
                ?.deviceId},${compareList.at(1)?.deviceId}`}
            >
              Compare
            </Link>
          </div>
          <div id="results" className="flex flex-col mt-4">
            {data?.devices.map((computer: ComputerResultResponse) => (
              <ResultPane
                key={computer.deviceId}
                computer={computer}
                onChange={addToCompareList}
                disabled={
                  compareList.length === 2 && !compareList.includes(computer)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
