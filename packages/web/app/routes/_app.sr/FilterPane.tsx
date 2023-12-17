import { Form, useNavigate } from "@remix-run/react";
import { FilterItem } from "./FilterItem";

export function FilterPane() {
  const navigate = useNavigate();
  return (
    <div className="mr-4 border w-[350px] h-fit p-4">
      <h1 className="font-bold">Filter items</h1>
      <Form className="flex flex-col text-sm" onSubmit={(event) => {
        const body = new FormData(event.currentTarget);

        const { searchParams } = new URL(window.location.toString());

  const store = searchParams.get("storeName") ?? "";
  const price = body.getAll("price");
  const memory = body.getAll("memoryMb");
  const storage = body.getAll("storageGb");
  const processor = body.getAll("processorManufacturer");
  const model = body.getAll("processorModel");
  const gpu = body.getAll("gpuModel");

  window.location.assign(
    `/sr?storeName=${store}&price=${price}&memoryMb=${memory}&storageGb=${storage}&processorManufacturer=${processor}&processorModel=${model}&gpuModel=${gpu}`
  );
      }}>
        <h2 className="font-medium pt-2 pb-1">Price</h2>
        <FilterItem value="0-500" name="price" text="$500 or less" />
        <FilterItem value="501-1000" name="price" text="$501 - $1,000" />
        <FilterItem value="1001-1500" name="price" text="$1,001 - $1,500" />
        <FilterItem value="1501-2000" name="price" text="$1,501 - $2000" />
        <FilterItem value="2001" name="price" text="$2,001 or more" />
        <h2 className="font-medium pt-2 pb-1">Memory</h2>
        <FilterItem value="0-4" name="memoryMb" text="4GB or less" />
        <FilterItem value="8" name="memoryMb" text="8GB" />
        <FilterItem value="16" name="memoryMb" text="16GB" />
        <FilterItem value="32" name="memoryMb" text="32GB or more" />
        <h2 className="font-medium pt-2 pb-1">Storage size</h2>
        <FilterItem value="0-256" name="storageGb" text="256GB or less" />
        <FilterItem value="512" name="storageGb" text="512GB" />
        <FilterItem value="1024" name="storageGb" text="1TB" />
        <FilterItem value="2048" name="storageGb" text="2TB or more" />
        <h2 className="font-medium pt-2 pb-1">All processors</h2>
        <FilterItem
          value="Intel"
          name="processorManufacturer"
          text="All Intel Processors"
        />
        <FilterItem
          value="AMD"
          name="processorManufacturer"
          text="All AMD Processors"
        />
        <h2 className="font-medium pt-2 pb-1">Processor models</h2>
        <FilterItem value="Intel i9" name="processorModel" text="Intel i9" />
        <FilterItem value="Intel i7" name="processorModel" text="Intel i7" />
        <FilterItem
          value="AMD Ryzen 9"
          name="processorModel"
          text="AMD Ryzen 9"
        />
        <FilterItem
          value="AMD Ryzen 7"
          name="processorModel"
          text="AMD Ryzen 7"
        />

        <h2 className="font-medium pt-2 pb-1">GPU</h2>
        <FilterItem value="NVIDIA" name="gpuModel" text="All NVIDIA GPUs" />
        <FilterItem value="AMD" name="gpuModel" text="All AMD GPUs" />
        <FilterItem value="Intel" name="gpuModel" text="All Intel GPUs" />
        <FilterItem
          value="NVIDIA GeForce RTX 4090"
          name="gpuModel"
          text="NVIDIA GeForce RTX 4090"
        />
        <FilterItem
          value="NVIDIA GeForce RTX 4080"
          name="gpuModel"
          text="NVIDIA GeForce RTX 4080"
        />
        <FilterItem
          value="AMD Radeon Pro W6300"
          name="gpuModel"
          text="AMD Radeon Pro W6300"
        />
        <FilterItem
          value="AMD Radeon Pro W6400"
          name="gpuModel"
          text="AMD Radeon Pro W6400"
        />
        <FilterItem
          value="Intel Integrated Graphics"
          name="gpuModel"
          text="Intel Integrated Graphics"
        />
        <FilterItem
          value="Intel UHD Graphics 770"
          name="gpuModel"
          text="Intel UHD Graphics 770"
        />
        <FilterItem
          value="Intel UHD Graphics 730"
          name="gpuModel"
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
  );
}

// export const FilterPane = React.memo(FilterPaneMemo);
