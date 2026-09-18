import { publicClient } from "@/apis/clients";
import { URL_PATHS } from "./ip";

interface Envelope<T> {
  status: number;
  message: string;
  data: T;
}

async function unwrap<T>(promise: Promise<{ data: Envelope<T> }>): Promise<T> {
  const { data } = await promise;
  return data.data;
}

export interface SystemState {
  id?: string;
  initialized: boolean;
  initializedAt?: string;
  initializationVersion?: string;
  resetCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const GetErrorTranslations = async (lang: string): Promise<Record<string, unknown>> => {
  const { data } = await publicClient.get<Record<string, unknown>>(URL_PATHS.SYSTEM.i18nErrors(lang));
  return data;
};

export const GetLatestSystemState = () => unwrap<SystemState>(publicClient.get(URL_PATHS.SYSTEM.latest));

export const InitializeSystem = (version = "1.0.0") => unwrap<SystemState>(publicClient.post(URL_PATHS.SYSTEM.initialize, { version }));
