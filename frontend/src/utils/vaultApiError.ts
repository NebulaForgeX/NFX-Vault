import type { AxiosError } from "axios";

/** Vault / FastAPI：优先 `message`（业务 JSON），其次 `detail`（校验或 500 默认体） */
export function vaultApiErrorMessage(error: unknown, fallback: string): string {
  const ax = error as AxiosError<Record<string, unknown>> | undefined;
  const d = ax?.response?.data;
  if (!d || typeof d !== "object") return fallback;

  const message = d.message;
  if (typeof message === "string" && message.trim()) return message;

  const detail = d.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((item) => {
        if (item && typeof item === "object" && "msg" in item) {
          const m = (item as { msg?: string }).msg;
          return typeof m === "string" ? m : "";
        }
        return "";
      })
      .filter(Boolean);
    if (msgs.length) return msgs.join("; ");
  }

  return fallback;
}
