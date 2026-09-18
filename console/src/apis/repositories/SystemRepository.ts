import type { SystemState } from "@/apis/system.api";

import { GetErrorTranslations, GetLatestSystemState, InitializeSystem } from "@/apis/system.api";

export interface SystemRepository {
  GetErrorTranslations(lang: string): Promise<Record<string, unknown>>;
  GetLatestSystemState(): Promise<SystemState>;
  InitializeSystem(version?: string): Promise<SystemState>;
}

export class ApiSystemRepository implements SystemRepository {
  GetErrorTranslations = GetErrorTranslations;
  GetLatestSystemState = GetLatestSystemState;
  InitializeSystem = InitializeSystem;
}
