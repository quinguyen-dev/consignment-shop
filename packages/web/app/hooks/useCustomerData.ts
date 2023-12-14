import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type {
  CustomerStoreResponse,
  HomePageResponse,
  SearchResultResponse,
} from "./types";

export function useCustomerData() {
  const fetchAll = () =>
    useQuery<CustomerStoreResponse, Error>({
      queryKey: ["store_list"],
      queryFn: async (): Promise<CustomerStoreResponse> => {
        const response = await axios.get("customer/list-stores");
        return { stores: response.data };
      },
    });

  const fetchInventory = (storeName: string) =>
    useQuery<CustomerStoreResponse, Error>({
      queryKey: ["list"],
      queryFn: async (): Promise<CustomerStoreResponse> => {
        const response = await axios.get(
          `customer/inventory?storeName=${storeName}`,
        );
        return { stores: response.data };
      },
    });

  const fetchStoreInfo = (storeName: string) =>
    useQuery<SearchResultResponse, Error>({
      queryKey: [`${storeName}`],
      queryFn: async (): Promise<SearchResultResponse> => {
        const response = await axios.get(
          `customer/store-inventory?storeName=${storeName}`,
        );
        return response.data;
      },
    });

  const fetchHomePageData = () =>
    useQuery<HomePageResponse, Error>({
      queryKey: ["homepage_data"],
      queryFn: async (): Promise<HomePageResponse> => {
        const response = await axios.get("homepage-data");
        return response.data;
      },
    });

  return { fetchAll, fetchStoreInfo, fetchHomePageData };
}
