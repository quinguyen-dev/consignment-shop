import { useMutation, useQuery } from "@tanstack/react-query";
import type {SiteManagerResponse, Store} from "./types";
import axios from "axios";
import { useContext } from "react";
import { AuthContext, IAuthContext } from "react-oauth2-code-pkce";
import {useQueryClient} from "@tanstack/react-query";
import {convert} from "@/utils/convert.ts";

export function useSiteManagerData() {
    const queryClient = useQueryClient();
    const authContext = useContext<IAuthContext>(AuthContext);

  const fetchAll = () =>
    useQuery<SiteManagerResponse, Error>({
      queryKey: ["site_manager_data"],
      queryFn: async (): Promise<SiteManagerResponse> => {
        const response = await axios.get(
          `/site-manager/dashboard`,
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
          totalBalance: body.inventoryValue,
          managerBalance: body.managerBalance,
          stores: body.storeBalances.map((store: any) => convert(store)),
        } satisfies SiteManagerResponse;
      },
    });

  const remove =
    useMutation<Store, Error, string>({
      mutationFn: async (storeId: string): Promise<any> => {
        const response = await axios.delete(
          "/site-manager" + new URLSearchParams({"store_id": storeId}).toString(),
          {
            headers: {
              Authorization: `Bearer ${authContext.token}`,
            },
          }
        );
        return response.data;
      },
      onSuccess: async () => {
          await queryClient.invalidateQueries({queryKey: ["site_manager_data"]})
      }
    });

  return { fetchAll, remove };
}
