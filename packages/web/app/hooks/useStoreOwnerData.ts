import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { InventoryResponse, StoreOwnerResponse } from "./types";

export function useStoreOwnerData(jwt: string) {
  const fetchAll = () =>
    useQuery<StoreOwnerResponse, Error>({
      queryKey: ["store_owner_data"],
      queryFn: async (): Promise<StoreOwnerResponse> => {
        const response = await axios.get(`/store-owner/user-info`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        return response.data;
      },
    });

  const create = (_: InventoryResponse) =>
    useMutation<InventoryResponse, Error>({
      mutationFn: async (): Promise<any> => {},
    });

  const remove = (_: number) =>
    useMutation<InventoryResponse, Error>({
      mutationFn: async (): Promise<any> => {},
    });

  return { fetchAll, create, remove };
}
