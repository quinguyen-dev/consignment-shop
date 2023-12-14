import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { CustomerStoreResponse, StoreInventoryResponse } from "./types";

export function useCustomerData() {
  const fetchAll = () =>
    useQuery<CustomerStoreResponse, Error>({
      queryKey: ["store_list"],
      queryFn: async (): Promise<CustomerStoreResponse> => {
        const response = await axios.get("customer/list-stores");
        return { stores: response.data };
      },
    });

  const fetchStoreInfo = (storeName: string) =>
    useQuery<StoreInventoryResponse, Error>({
      queryKey: [`${storeName}`],
      queryFn: async (): Promise<StoreInventoryResponse> => {
        const response = await axios.get(
          `customer/store-inventory?storeName=${storeName}`,
        );
        return response.data;
      },
    });

  return { fetchAll, fetchStoreInfo };
}
