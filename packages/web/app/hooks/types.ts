export type Computer = {
  deviceId: string;
  storeId: string;
  deviceName: string;
  formFactor: string;
  processorManufacturer: string;
  processorModel: string;
  memoryType: string;
  memoryMb: number;
  storageType: string;
  storageGb: number;
  price: number;
  operatingSystem: string;
  dedicatedGpu: boolean;
  gpuManufacturer: string;
  gpuModel: string;
  listingActive: boolean;
};

export type InventoryResponse = StoreOwnerResponse & {
  devices: Computer[];
};

export type SiteManagerResponse = {
  totalBalance: number;
  managersBalance: number;
  stores: Store[];
};

export type StoreReport = {
  inventoryValue: number;
  deviceCount: number;
} & Store;

export type SiteManagerReport = {
  managersBalance: number;
  totalInventoryValue: number;
  storeBalances: StoreReport[];
};

export type StoreOwnerResponse = {
  storeId: string;
  storeName: string;
  accountBalance: number;
  updatedAt: string;
  streetAddress: string;
  latitude: number;
  longitude: number;
  totalInventoryValue: number;
  storeOwnerId: string;
};

export type Store = {
  storeId: string;
  storeName: string;
  balance: number;
};

export type StoreInventoryResponse = Omit<InventoryResponse, "totalBalance">;

export type CustomerStoreResponse = {
  stores: Omit<Store, "balance">[];
};

export type EstimatedShippingResponse = {
  shippingCost: number;
  managersCut: number;
  deviceCost: number;
};

export type ComputerResultResponse = Computer & { storeName: string };

export type SearchResultResponse = {
  devices: ComputerResultResponse[];
  storeName: string;
};

export type HomePageResponse = {
  selecDevices: ComputerResultResponse[];
  selecStores: Store[];
};

export type SearchResultInput = {
  storeName: string;
  price: string;
  memoryMb: string;
  storageGb: string;
  processorManufacturer: string;
  processorModel: string;
  gpuModel: string;
};
