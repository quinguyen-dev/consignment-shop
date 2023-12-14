import { Link, useSearchParams } from "@remix-run/react";
import { ResultPane } from "ResultPane";
import { useState } from "react";
import Modal from "react-modal";
import placeholderIcon from "~/assets/placeholder.svg";
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
      <Modal
        isOpen={false}
        className="flex justify-center align-center bg-white w-11/12 py-12 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="flex space-x-4">
          {compareList.map((computer: Computer) => (
            <div className="p-4 rounded-2xl">
              <div className="w-[256px] aspect-square flex justify-center items-center rounded-lg bg-gray-200 mb-4 self-center">
                <img src={placeholderIcon} alt="product image" />
              </div>
              <h1 className="font-bold text-lg text-center">
                {computer.deviceName}
              </h1>
              <h2 className="font-medium text-lg mb-4 text-center">
                ${computer.price}
              </h2>
              <div className="flex space-x-12">
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
      </Modal>
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
            <Link
              className={`px-4 py-2 rounded-xl text-sm bg-blue-500 text-white ${
                compareList.length === 2 ? "opacity-100" : "opacity-50"
              }`}
              to={`/compare/?list=${compareList.at(0)
                ?.deviceId},${compareList.at(1)?.deviceId}`}
            >
              Compare
            </Link>
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
