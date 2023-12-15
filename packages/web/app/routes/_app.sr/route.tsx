import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, Link, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { Computer, ComputerResultResponse } from "~/hooks/types";
import { useCustomerData } from "~/hooks/useCustomerData";
import { ResultPane } from "~/routes/_app.sr/ResultPane";
import { FilterItem } from "./FilterItem";

export async function action({ request }: ActionFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const body = await request.formData();

  const store = searchParams.get("store");
  const query = searchParams.get("query");
  const price = body.getAll("price");
  const memory = body.getAll("memory");
  const storage = body.getAll("storage");
  const processor = body.getAll("processor");
  const processorGen = body.getAll("processor_gen");
  const gpu = body.getAll("gpu");

  return redirect(
    `/sr?store=${store}&query=${query}&price=${price}&memory=${memory}&storage=${storage}&processor=${processor}&processor_gen=${processorGen}&gpu=${gpu}`,
  );
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
        <div className="mr-4 border w-[350px] h-fit p-4">
          <h1 className="font-bold">Filter items</h1>
          <Form className="flex flex-col text-sm" method="post">
            <h2 className="font-medium pt-2 pb-1">Price</h2>
            <FilterItem value="0-500" name="price" text="$500 or less" />
            <FilterItem value="501-1000" name="price" text="$501 - $1,000" />
            <FilterItem value="1001-1500" name="price" text="$1,001 - $1,500" />
            <FilterItem value="1501-2000" name="price" text="$1,501 - $2000" />
            <FilterItem value="2001-inf" name="price" text="$2,001 or more" />
            <h2 className="font-medium pt-2 pb-1">Memory</h2>
            <FilterItem value="0-4" name="memory" text="4GB or less" />
            <FilterItem value="8" name="memory" text="8GB" />
            <FilterItem value="16" name="memory" text="16GB" />
            <FilterItem value="32-inf" name="memory" text="32GB or more" />
            <h2 className="font-medium pt-2 pb-1">Storage size</h2>
            <FilterItem value="0-256" name="storage" text="256GB or less" />
            <FilterItem value="512" name="storage" text="512GB" />
            <FilterItem value="1024" name="storage" text="1TB" />
            <FilterItem value="2048-inf" name="storage" text="2TB or more" />
            <h2 className="font-medium pt-2 pb-1">All processors</h2>
            <FilterItem
              value="Intel"
              name="processor"
              text="All Intel Processors"
            />
            <FilterItem
              value="AMD"
              name="processor"
              text="All AMD Processors"
            />
            <FilterItem value="Intel i9" name="processor" text="Intel i9" />
            <FilterItem value="Intel i7" name="processor" text="Intel i7" />
            <FilterItem
              value="AMD Ryzen 9"
              name="processor"
              text="AMD Ryzen 9"
            />
            <FilterItem
              value="AMD Ryzen 7"
              name="processor"
              text="AMD Ryzen 7"
            />
            <h2 className="font-medium pt-2 pb-1">Processor Generation</h2>
            <FilterItem
              value="13th Gen Intel"
              name="processor_gen"
              text="13th Gen Intel"
            />
            <FilterItem
              value="12th Gen Intel"
              name="processor_gen"
              text="12th Gen Intel"
            />
            <FilterItem
              value="11th Gen Intel"
              name="processor_gen"
              text="11th Gen Intel"
            />
            <FilterItem
              value="AMD Ryzen 7000 Series"
              name="processor_gen"
              text="AMD Ryzen 7000 Series"
            />
            <FilterItem
              value="AMD Ryzen 6000 Series"
              name="processor_gen"
              text="AMD Ryzen 6000 Series"
            />
            <h2 className="font-medium pt-2 pb-1">GPU</h2>
            <FilterItem value="NVIDIA" name="gpu" text="All NVIDIA GPUs" />
            <FilterItem value="AMD" name="gpu" text="All AMD GPUs" />
            <FilterItem value="Intel" name="gpu" text="All Intel GPUs" />
            <FilterItem
              value="NVIDIA GeForce RTX 4090"
              name="gpu"
              text="NVIDIA GeForce RTX 4090"
            />
            <FilterItem
              value="NVIDIA GeForce RTX 4080"
              name="gpu"
              text="NVIDIA GeForce RTX 4080"
            />
            <FilterItem
              value="AMD Radeon Pro W6300"
              name="gpu"
              text="AMD Radeon Pro W6300"
            />
            <FilterItem
              value="AMD Radeon Pro W6400"
              name="gpu"
              text="AMD Radeon Pro W6400"
            />
            <FilterItem
              value="Intel Integrated Graphics"
              name="gpu"
              text="Intel Integrated Graphics"
            />
            <FilterItem
              value="Intel UHD Graphics 770"
              name="gpu"
              text="Intel UHD Graphics 770"
            />
            <FilterItem
              value="Intel UHD Graphics 730"
              name="gpu"
              text="Intel UHD Graphics 730"
            />

            <button
              className="px-2 py-1.5 mt-4 border rounded-md bg-[#48576B] text-white"
              type="submit"
            >
              Filter list
            </button>
          </Form>
        </div>
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
