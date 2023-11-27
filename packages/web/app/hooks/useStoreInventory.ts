import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { convert } from "~/utils/convert";
import type { Computer, InventoryResponse } from "./types";

export function useStoreInventory(jwt: string) {
  const queryClient = useQueryClient();

  const fetchAll = () =>
    useQuery<InventoryResponse, Error>({
      queryKey: ["store_inventory"],
      queryFn: async (): Promise<InventoryResponse> => {
        const response = await axios.get(`/store-owner/dashboard`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        return response.data;
      },
      select: (data: any) => {
        return {
          storeName: data.storeName,
          storeId: data.storeId,
          accountBalance: data.accountBalance,
          totalInventoryValue: data.totalInventoryValue,
          inventory: data.inventory.map((computer: any) => convert(computer)),
        } satisfies InventoryResponse;
      },
    });

  const create = () =>
    useMutation<Computer, Error, Computer>({
      mutationFn: async (data: Computer): Promise<any> => {
        const response = await axios.post("/store-owner/new-device", data, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        return response.data;
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["store_inventory"] }), // todo change this to setQueryData()
    });

  const remove = () =>
    useMutation<Computer, Error, string>({
      mutationFn: async (deviceId: string): Promise<any> => {
        const response = await axios.post(
          "/store-owner/remove-device",
          {
            deviceId: deviceId
          },
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          },
        );
        return response.data;
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["store_inventory"] }), // todo change this to setQueryData()
    });

  return { fetchAll, create, remove };
}
