import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { SiteManagerReport, SiteManagerResponse, Store } from "./types";

export function useSiteManagerData(jwt: string) {
  const queryClient = useQueryClient();

  const fetchAll = () =>
    useQuery<SiteManagerResponse, Error>({
      queryKey: ["site_manager_data"],
      queryFn: async (): Promise<SiteManagerResponse> => {
        const response = await axios.get("/site-manager/dashboard", {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        return response.data;
      },
    });

  const fetchReport = () =>
    useQuery<SiteManagerReport, Error>({
      queryKey: ["site_manager_report"],
      queryFn: async (): Promise<SiteManagerReport> => {
        const response = await axios.get(`/site-manager/dashboard`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        return response.data;
      },
    });

  const remove = useMutation<Store, Error, string>({
    mutationFn: async (storeId: string): Promise<any> => {
      const response = await axios.delete(
        "/site-manager/remove-store?" +
          new URLSearchParams({ storeId: storeId }).toString(),
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );
      return response.data;
    },
    onSuccess: async () => {
              await queryClient.invalidateQueries({ queryKey: ["site_manager_data"] });
      await queryClient.invalidateQueries({ queryKey: ["site_manager_report"] });
    },
  });

  return { fetchAll, fetchReport, remove };
}
