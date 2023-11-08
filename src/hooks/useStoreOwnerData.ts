import axios from "axios";
import { useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthContext, IAuthContext } from "react-oauth2-code-pkce";
import type { InventoryResponse, StoreOwnerResponse } from "./types";

export function useStoreOwnerData() {
  const authContext = useContext<IAuthContext>(AuthContext);

  const fetchAll = () =>
    useQuery<StoreOwnerResponse, Error>({
      queryKey: ["store_owner_data"],
      queryFn: async (): Promise<StoreOwnerResponse> => {
        const response = await axios.get(`/store-owner/user-info`, {
          headers: {
            Authorization: `Bearer ${authContext.token}`,
          },
        });
        return response.data;
      },
      select: (data: any) => {
        const { body } = data;

        return {
          username: body.username,
          userId: body.user_id,
          storeId: body.store_id,
          totalBalance: body.total_balance,
          storeName: body.store_name,
        } satisfies StoreOwnerResponse;
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
