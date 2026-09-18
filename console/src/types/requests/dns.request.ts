export interface UpsertNamecheapCredentialRequest {
  apiUser: string;
  userName?: string;
  apiKey?: string;
  clientIp: string;
  sandbox?: boolean;
}

export interface UpsertNamecheapDdnsHostRequest {
  domain: string;
  host: string;
  ddnsPassword?: string;
}

export interface DeleteNamecheapDdnsHostRequest {
  id: string;
}

export interface UpdateDnsARecordsRequest {
  ip: string;
  items: Array<{ domain: string; host: string }>;
}
