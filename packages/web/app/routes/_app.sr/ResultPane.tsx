import placeholderIcon from "~/assets/placeholder.svg";
import { Computer, ComputerResultResponse } from "~/hooks/types";

interface ResultPaneProps {
  computer: ComputerResultResponse;
  onChange: (computer: Computer) => void;
  disabled: boolean;
}

export function ResultPane({ computer, disabled, onChange }: ResultPaneProps) {
  return (
    <div className="border p-4 flex mb-4">
      <input
        type="checkbox"
        className="mr-4"
        disabled={disabled}
        onChange={() => onChange(computer)}
      />
      <div className="w-[212px] lg:h-[128px] h-[196px] flex justify-center items-center rounded-lg bg-gray-200">
        <img src={placeholderIcon} alt="product image" />
      </div>
      <div className="flex flex-col lg:flex-row w-full lg:ml-0 ml-4">
        <div className="lg:ml-4 w-full lg:w-1/2 flex flex-row lg:flex-col justify-between lg:justify-normal">
          <div>
            <h2 className="font-bold">{computer.deviceName}</h2>
            <p className="hover:underline text-xs text-gray-500 cursor-pointer">
              {computer.stores.storeName}
            </p>
          </div>
          <p className="font-medium">$3000</p>
        </div>
        <div className="text-gray-500 text-sm w-full flex mt-4 lg:mt-0">
          <div className="w-fit font-bold">
            <p>Processor Model:</p>
            <p>GPU Model:</p>
            <p>Storage GB:</p>
            <p>Memory MB:</p>
          </div>
          <div className="ml-4">
            <p>{computer.processorModel}</p>
            <p>{computer.gpuModel}</p>
            <p>{computer.storageGb}</p>
            <p>{computer.memoryMb}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
