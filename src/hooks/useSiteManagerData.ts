import { useMutation, useQuery } from "@tanstack/react-query";
import type { InventoryResponse, SiteManagerResponse } from "./types";
import axios from "axios";
import { useContext } from "react";
import { AuthContext, IAuthContext } from "react-oauth2-code-pkce";

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

export function useSiteManagerData() {
  const authContext = useContext<IAuthContext>(AuthContext);

  const fetchAll = () =>
    useQuery<SiteManagerResponse, Error>({
      queryKey: ["site_manager_data"],
      queryFn: async (): Promise<SiteManagerResponse> => {
        const response = await axios.get(
          `https://saqb4rb5je.execute-api.us-east-2.amazonaws.com/Initial/site-manager/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${authContext.token}`,
            },
          },
        );
        return response.data;
      },
      select: (data: any) => {
        const { body } = data;

        return {
          totalBalance: body.inventoryValue,
          managerBalance: body.managerBalance,
          stores: body.storeBalances.map((store: any) => convert(store)),
        } satisfies SiteManagerResponse;
      },
    });

  const create = (_: InventoryResponse) =>
    useMutation<InventoryResponse, Error>({
      mutationFn: async (): Promise<any> => {},
    });

  const remove = (_: string) =>
    useMutation<InventoryResponse, Error>({
      mutationFn: async (): Promise<any> => {},
    });

  return { fetchAll, create, remove };
}
