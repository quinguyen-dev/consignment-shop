import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { convert } from "@/utils/convert";
import type { Computer, InventoryResponse } from "./types";

export function useStoreInventory() {
  const queryClient = useQueryClient();

  const fetchAll = () =>
    useQuery<InventoryResponse, Error>({
      queryKey: ["store_inventory"],
      queryFn: async (): Promise<InventoryResponse> => {
        const response = await axios.get(
          `/store-owner/dashboard?storeID=4a699379-7d1d-11ee-9fda-02893a3229ad`
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

  const create = (item: Computer) =>
    useMutation<Computer, Error>({
      mutationFn: async (): Promise<any> =>
        axios.post("/store-owner/new-device", item),
      onSuccess: (newItem: Computer) => {
        queryClient.setQueryData(["store_inventory"], newItem);
      },
    });

  const remove = (itemId: number) =>
    useMutation<Computer, Error>({
      mutationFn: async (): Promise<any> => axios.delete(""),
    });

  return { fetchAll, create, remove };
}
