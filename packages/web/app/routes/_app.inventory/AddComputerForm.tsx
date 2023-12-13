import { useForm } from "react-hook-form";
import { Computer } from "~/hooks/types";

interface AddFormProps {
  setShowing: (value: boolean | ((prevVar: boolean) => boolean)) => void;
  onSubmit: (data: Computer) => void;
}

// todo change this to a modal and add type validatrion
export function AddComputerForm({ setShowing, onSubmit }: AddFormProps) {
  const { register, handleSubmit } = useForm<Computer>();

  return (
    <>
      <h1 className="mb-4 text-xl font-bold">Add a computer</h1>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <input
          className="mb-2 border px-4 py-2"
          placeholder="Product name"
          {...register("deviceName")}
        />
        <input
          className="mb-2 border px-2 py-4"
          placeholder="Price"
          {...register("price")}
        />
        <select
          className="mb-2 border px-4 py-2"
          placeholder="Memory (in MB)"
          {...register("memoryMb")}
        >
          <option value={4000}>4GB</option>
          <option value={8000}>8GB</option>
          <option value={160000}>16GB</option>
          <option value={32000}>32GB</option>
        </select>
        <select
          className="mb-2 border px-4 py-2"
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
          className="mb-2 border px-4 py-2"
          placeholder="Processor Model"
          {...register("processorModel")}
        />
        <select
          className="mb-2 border px-4 py-2"
          placeholder="GPU Manufacturer"
          {...register("gpuManufacturer")}
        >
          <option value="Intel">Intel</option>
          <option value="AMD">AMD</option>
          <option value="NVIDIA">NVIDIA</option>
        </select>
        <select
          className="mb-2 border px-4 py-2"
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
        <div className="mt-2 flex space-x-4">
          <button
            className="rounded-md bg-red-600 px-4 py-2 text-white"
            onClick={() => setShowing(false)}
          >
            Cancel
          </button>
          <input
            className="cursor-pointer rounded-md bg-green-600 px-4 py-2 text-white"
            type="submit"
            value="Confirm"
          />
        </div>
      </form>
    </>
  );
}
