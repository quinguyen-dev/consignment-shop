import { Link, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { Computer, ComputerResultResponse } from "~/hooks/types";
import { useCustomerData } from "~/hooks/useCustomerData";
import { ResultPane } from "~/routes/_app.sr/ResultPane";

/* Get all data if searching, otherwise, just get the search parameters */
export function loader() {
  return "test";
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [store, query] = [
    searchParams.get("store") ?? "",
    searchParams.get("query"),
  ];
  const [compareList, setCompareList] = useState<Computer[]>([]);
  const storeInfo = useCustomerData();
  const { data } = storeInfo.fetchStoreInfo(store);

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
          Showing {data?.devices.length ?? 0} search results for "{query}"
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
              to={`/compare?list=${compareList.at(0)
                ?.deviceId},${compareList.at(1)?.deviceId}`}
            >
              Compare
            </Link>
          </div>
          <div id="results" className="flex flex-col mt-4">
            {data?.devices.map((computer: ComputerResultResponse) => (
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
