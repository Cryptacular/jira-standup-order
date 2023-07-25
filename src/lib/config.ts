import { getLocalStorageService } from "./storage/localStorageService";

export interface Config {
  shouldSyncWithServer: boolean;
}

export const defaultConfig: Config = {
  shouldSyncWithServer: false,
};

const localStorageService = getLocalStorageService<Config>();

export const getConfig = async (): Promise<Config> =>
  (await localStorageService.get("config")) || { ...defaultConfig };

export const setConfig = async (config: Config) =>
  await localStorageService.set("config", config);
