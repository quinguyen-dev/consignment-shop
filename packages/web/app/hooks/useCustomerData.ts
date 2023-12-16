import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type {
  ComputerResultResponse,
  CustomerStoreResponse,
  HomePageResponse,
  SearchResultInput,
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
      staleTime: 0,
    });

  const fetchStoreInfo = (query: SearchResultInput) =>
    useQuery<SearchResultResponse, Error>({
      queryKey: [`${query.storeName}`],
      queryFn: async (): Promise<SearchResultResponse> => {
        const response = await axios.get(
          `customer/store-inventory?storeName=${query.storeName}&price=${query.price}&memoryMb=${query.memoryMb}&storageGb=${query.storageGb}&processorManufacturer=${query.processorManufacturer}&processorModel=${query.processorModel}&gpuModel=${query.gpuModel}`,
        );

        return { devices: response.data };
      },
      staleTime: 1,
    });

  const fetchHomePageData = () =>
    useQuery<HomePageResponse, Error>({
      queryKey: ["homepage_data"],
      queryFn: async (): Promise<HomePageResponse> => {
        const response = await axios.get("homepage-data");
        return response.data;
      },
    });

  const fetchDevice = (deviceId: string) =>
    useQuery<ComputerResultResponse, Error>({
      queryKey: [`${deviceId}`],
      queryFn: async (): Promise<ComputerResultResponse> => {
        const response = await axios.get(
          `customer/device?deviceId=${deviceId}`,
        );
        return response.data;
      },
    });

  return { fetchAll, fetchStoreInfo, fetchHomePageData, fetchDevice };
}
