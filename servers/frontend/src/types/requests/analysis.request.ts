// Analysis Request Types - 与 NFX-Identity/console types/requests 结构对齐

export interface AnalyzeTLSRequest {
  certificate: string;
  privateKey?: string;
}
