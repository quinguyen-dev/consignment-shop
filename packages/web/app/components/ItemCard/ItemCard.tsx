import { Link } from "@remix-run/react";
import placeholderIcon from "~/assets/placeholder.svg";
import { ComputerResultResponse } from "~/hooks/types";

interface ItemCardProps {
  computer: ComputerResultResponse;
  variant?: "sm" | "md" | "lg";
}

export function ItemCard({ computer, variant = "lg" }: ItemCardProps) {
  return (
    <div key={computer.deviceId} className="border p-4 rounded-xl">
      {variant === "lg" && (
        <div className="w-full h-[200px] flex justify-center items-center rounded-lg bg-gray-200 mb-4 ">
          <img src={placeholderIcon} alt="product image" />
        </div>
      )}
      <Link
        to={`/${computer.deviceName}/p/${computer.deviceId}`}
        className="text-lg font-bold"
      >
        {computer.deviceName}
      </Link>
      {variant !== "sm" && (
        <p className="text-sm text-gray-500">
          Sold by:{" "}
          <Link
            to={`/sr?store=${computer.storeName}&query=`}
            className="hover:underline"
          >
            {computer.storeName}
          </Link>
        </p>
      )}
      <p className="text-md font-medium">${computer.price}</p>
    </div>
  );
}
