import placeholderIcon from "~/assets/placeholder.svg";
import { Computer } from "~/hooks/types";

interface ResultPaneProps {
  computer: Computer;
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
      <div className="min-w-[128px] aspect-square flex justify-center items-center rounded-lg bg-gray-200">
        <img src={placeholderIcon} alt="product image" />
      </div>
      <div className="w-1/2 ml-4">
        <h2 className="font-bold">{computer.deviceName}</h2>
        <p className="hover:underline text-sm text-gray-500 cursor-pointer">
          Super long computer store
        </p>
        <p className="font-medium">$3000</p>
      </div>
      <div className="text-gray-500 text-sm w-full flex">
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
  );
}
