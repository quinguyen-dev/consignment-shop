import { Link } from "@remix-run/react";
import placeholderIcon from "~/assets/placeholder.svg";
import { Store } from "~/hooks/types";

interface StoreCardProps {
  store: Omit<Store, "balance">;
  variant?: "sm" | "md";
}

export function StoreCard({ store, variant = "md" }: StoreCardProps) {
  return (
    <Link
      to={`/sr?store=${store.storeName}&query=`}
      key={store.storeId}
      className="border px-4 py-4 flex space-x-3 rounded-lg h-full"
    >
      {variant === "md" && (
        <div className="min-w-[64px] aspect-square flex justify-center items-center rounded-lg bg-gray-200">
          <img src={placeholderIcon} alt="product image" />
        </div>
      )}
      <h2 className="font-bold">{store.storeName}</h2>
    </Link>
  );
}
