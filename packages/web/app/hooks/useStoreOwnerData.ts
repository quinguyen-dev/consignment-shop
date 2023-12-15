import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { StoreOwnerResponse } from "./types";

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

  return { fetchAll };
}
