import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { CustomerStoreResponse, StoreInventoryResponse } from "./types";

export function useCustomerData() {
  const queryClient = useQueryClient();

  const fetchAll = () =>
    useQuery<CustomerStoreResponse, Error>({
      queryKey: ["stores"],
      queryFn: async (): Promise<CustomerStoreResponse> => {
        const response = await axios.get("customer/list-stores");
        return response.data;
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
