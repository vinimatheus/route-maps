import type L from 'leaflet'
import 'leaflet-routing-machine'

declare global {
  interface Window {
    L: typeof L & {
      Routing: typeof import('leaflet-routing-machine')
    }
  }
}
