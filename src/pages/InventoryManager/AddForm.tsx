import { Computer } from "@/hooks/types";
import { useForm } from "react-hook-form";

interface AddFormProps {
  setShowing: (value: boolean | ((prevVar: boolean) => boolean)) => void;
  onSubmit: (data: Computer) => void;
}

export function AddForm({ setShowing, onSubmit }: AddFormProps) {
  const { register, handleSubmit } = useForm<Computer>();

  return (
    <>
      <h1 className="text-xl font-bold mb-4">Add a computer</h1>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <input
          className="border px-4 py-2 mb-2"
          placeholder="Product name"
          {...register("deviceName")}
        />
        <input
          className="border px-4 py-2 mb-2"
          placeholder="Price"
          {...register("price")}
        />
        <select
          className="border px-4 py-2 mb-2"
          placeholder="Memory (in MB)"
          {...register("memoryMb")}
        >
          <option value={4000}>4GB</option>
          <option value={8000}>8GB</option>
          <option value={160000}>16GB</option>
          <option value={32000}>32GB</option>
        </select>
        <select
          className="border px-4 py-2 mb-2"
          placeholder="Storage (in GB)"
          {...register("storageGb")}
        >
          <option value={256}>256GB</option>
          <option value={512}>512GB</option>
          <option value={1000}>1TB</option>
          <option value={2000}>2GB</option>
          <option value={4000}>4TB</option>
        </select>
        <input
          className="border px-4 py-2 mb-2"
          placeholder="Processor Model"
          {...register("processorModel")}
        />
        <select
          className="border px-4 py-2 mb-2"
          placeholder="GPU Manufacturer"
          {...register("gpuManufacturer")}
        >
          <option value="Intel">Intel</option>
          <option value="AMD">AMD</option>
          <option value="NVIDIA">NVIDIA</option>
        </select>
        <select
          className="border px-4 py-2 mb-2"
          placeholder="GPU Model"
          {...register("gpuModel")}
        >
          <option value="NVIDIA GeForce RTX 4090">
            NVIDIA GeForce RTX 4090
          </option>
          <option value="NVIDIA GeForce RTX 4080">
            NVIDIA GeForce RTX 4080
          </option>
          <option value="AMD Radeon Pro W6300">AMD Radeon Pro W6300</option>
          <option value="AMD Radeon Pro W6400">AMD Radeon Pro W6400</option>
          <option value="Intel Integrated Graphics">
            Intel Integrated Graphics
          </option>
          <option value="Intel UHD Graphics 730">Intel UHD Graphics 730</option>
          <option value="Intel UHD Graphics 770">Intel UHD Graphics 770</option>
        </select>
        <div className="flex space-x-4 mt-2">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-md"
            onClick={() => setShowing(false)}
          >
            Cancel
          </button>
          <input
            className="bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer"
            type="submit"
            value="Confirm"
          />
        </div>
      </form>
    </>
  );
}
