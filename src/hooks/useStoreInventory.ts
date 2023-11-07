import { useMutation, useQuery } from "@tanstack/react-query";
import type { Computer } from "./types";
import axios from "axios";

export function useStoreInventory() {
  const queryResponse = useQuery<Computer, Error>({
    queryKey: ["store_inventory"],
    queryFn: async (): Promise<any> => {
      const response = await axios.get(
        "https://saqb4rb5je.execute-api.us-east-2.amazonaws.com/Initial/store-owner/dashboard",
      );
      return response.data;
    },
  });

  const create = (item: Computer) =>
    useMutation<Computer, Error>({
      mutationFn: async (): Promise<any> => {},
    });

  const remove = (itemId: number) =>
    useMutation<Computer, Error>({
      mutationFn: async (): Promise<any> => {},
    });

  return { ...queryResponse, create, remove };
}
