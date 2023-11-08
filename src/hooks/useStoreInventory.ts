import axios from "axios";
import { useContext } from "react";
import { convert } from "@/utils/convert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext, type IAuthContext } from "react-oauth2-code-pkce";
import type { Computer, InventoryResponse } from "./types";

export function useStoreInventory() {
  const queryClient = useQueryClient();
  const authContext = useContext<IAuthContext>(AuthContext);

  const fetchAll = () =>
    useQuery<InventoryResponse, Error>({
      queryKey: ["store_inventory"],
      queryFn: async (): Promise<InventoryResponse> => {
        const response = await axios.get(
          `/store-owner/dashboard?storeID=4a699379-7d1d-11ee-9fda-02893a3229ad`,
          {
            headers: {
              Authorization: `Bearer ${authContext.token}`,
            },
          }
        );
        return response.data;
      },
      select: (data: any) => {
        const { body } = data;

        return {
          storeName: body.store_name,
          storeId: body.store_id,
          totalBalance: body.total_balance,
          inventory: body.inventory.map((computer: any) => convert(computer)),
        } satisfies InventoryResponse;
      },
    });

  const create = () =>
    useMutation<Computer, Error, Computer>({
      mutationFn: async (data: Computer): Promise<any> => {
        const response = await axios.post("/store-owner/new-device", data, {
          headers: {
            Authorization: `Bearer ${authContext.token}`,
          },
        });

        return response.data;
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["store_inventory"] }), // todo change this to setQueryData()
    });

  const remove = () =>
    useMutation<Computer, Error, string>({
      mutationFn: async (storeId: string): Promise<any> => {
        const response = await axios.post(
          "/store-owner/new-device",
          { storeId: storeId },
          {
            headers: {
              Authorization: `Bearer ${authContext.token}`,
            },
          }
        );
        return response.data;
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["store_inventory"] }), // todo change this to setQueryData()
    });

  return { fetchAll, create, remove };
}
