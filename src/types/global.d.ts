import type L from 'leaflet'
import 'leaflet-routing-machine'

declare global {
  interface Window {
    L: typeof L & {
      Routing: typeof import('leaflet-routing-machine')
    }
  }
}


export interface CsvRow {
  [key: string]: string
}

export interface ColumnMapping {
  cep: string
  description?: string
}

interface ResultItem {
  cep: string;
  description?: string;
  status: "success" | "error";
  data?: RouteAddress;
  errorMessage?: string; // ✅ Adiciona esta linha!
}
