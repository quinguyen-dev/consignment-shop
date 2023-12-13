import { useSearchParams } from "@remix-run/react";
import { ResultPane } from "ResultPane";
import { useState } from "react";
import { Computer } from "~/hooks/types";

/* Get all data if searching, otherwise, just get the search parameters */
export function loader() {
  return "test";
}

const test: Computer[] = [
  {
    deviceId: "e1300ee5-8cd8-11ee-b2f1-02893a3229ad",
    storeId: "21191237-8a6b-11ee-b2f1-02893a3229ad",
    processorManufacturer: "hello",
    deviceName: "TEST DEVICE POSTMAN",
    formFactor: "Laptop",
    processorModel: "TEST MODEL",
    memoryType: "DDR 4",
    memoryMb: 1024,
    storageType: "SSD",
    storageGb: 1024,
    price: 8888,
    operatingSystem: "TEST OS",
    dedicatedGpu: true,
    gpuManufacturer: "TEST MAN",
    gpuModel: "TEST GPU",
    listingActive: true,
  },
  {
    deviceId: "fasdfasdf-8cd8-11ee-b2f1-02893a3229ad",
    storeId: "21191237-8a6b-11ee-b2f1-02893a3229ad",
    processorManufacturer: "hello",
    deviceName: "TEST DEVICE POSTMAN",
    formFactor: "Laptop",
    processorModel: "TEST MODEL",
    memoryType: "DDR 4",
    memoryMb: 1024,
    storageType: "SSD",
    storageGb: 1024,
    price: 8888,
    operatingSystem: "TEST OS",
    dedicatedGpu: true,
    gpuManufacturer: "TEST MAN",
    gpuModel: "TEST GPU",
    listingActive: true,
  },
  {
    deviceId: "ff-8cd8-11ee-b2f1-02893a3229ad",
    storeId: "21191237-8a6b-11ee-b2f1-02893a3229ad",
    processorManufacturer: "hello",
    deviceName: "TEST DEVICE POSTMAN",
    formFactor: "Laptop",
    processorModel: "TEST MODEL",
    memoryType: "DDR 4",
    memoryMb: 1024,
    storageType: "SSD",
    storageGb: 1024,
    price: 8888,
    operatingSystem: "TEST OS",
    dedicatedGpu: true,
    gpuManufacturer: "TEST MAN",
    gpuModel: "TEST GPU",
    listingActive: true,
  },
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [compareList, setCompareList] = useState<Computer[]>([]);

  function addToCompareList(computer: Computer) {
    const isAlreadySelected = compareList.includes(computer);

    if (isAlreadySelected)
      setCompareList((prev) => [
        ...prev.filter((comp: Computer) => computer.deviceId !== comp.deviceId),
      ]);
    else if (compareList.length < 2)
      setCompareList((prev) => [...prev, computer]);
  }

  return (
    <>
      <div className="p-2">
        <p className="text-xs">
          Showing 1000 search results for "{searchParams}"
        </p>
      </div>
      <hr />
      <div className="flex mt-4">
        <div className="mr-4 border w-[350px] h-[1000px] p-4">
          Filter options
        </div>
        <div className="w-full">
          <div className="flex justify-between items-end">
            <h1 className="text-xl font-bold">Results</h1>
            <button
              className={`px-4 py-2 rounded-xl text-sm bg-blue-500 text-white ${
                compareList.length === 2 ? "opacity-100" : "opacity-50"
              }`}
            >
              Compare
            </button>
          </div>
          <div id="results" className="flex flex-col mt-4">
            {test.map((computer: Computer) => (
              <ResultPane
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
