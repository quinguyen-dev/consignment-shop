import { useMutation, useQuery } from "@tanstack/react-query";
import type { Computer, InventoryResponse } from "./types";
import axios from "axios";

function convert(obj: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );
      result[camelCaseKey] = obj[key];
    }
  }
  return result;
}

export function useStoreInventory() {
  const fetchAll = () =>
    useQuery<InventoryResponse, Error>({
      queryKey: ["store_inventory"],
      queryFn: async (): Promise<InventoryResponse> => {
        const response = await axios.get(
          `https://saqb4rb5je.execute-api.us-east-2.amazonaws.com/Initial/store-owner/dashboard?storeID=4a699379-7d1d-11ee-9fda-02893a3229ad`,
        );
        return response.data;
      },
      select: (data: any) => {
        const { body } = data;

        return {
          totalBalance: body.total_balance,
          inventory: body.inventory.map((computer: any) => convert(computer)),
        } as InventoryResponse;
      },
    });

  const create = (_: Computer) =>
    useMutation<Computer, Error>({
      mutationFn: async (): Promise<any> => {},
    });

  const remove = (_: number) =>
    useMutation<Computer, Error>({
      mutationFn: async (): Promise<any> => {},
    });

  return { fetchAll, create, remove };
}
