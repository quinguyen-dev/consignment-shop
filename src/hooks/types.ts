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

export type InventoryResponse = {
  totalBalance: number;
  storeName: string;
  storeId: string;
  inventory: Computer[];
};

export type SiteManagerResponse = {
  totalBalance: number;
  managerBalance: number;
  stores: Store[];
};

export type StoreOwnerResponse = {
  username: string;
  userId: string;
  storeId: string;
  storeName: string;
  totalBalance: number;
};

export type Store = {
  storeId: string;
  storeName: string;
  balance: number;
};
