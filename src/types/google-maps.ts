export interface GoogleGeocodeResponse {
  status: string;
  results: GoogleGeocodeResult[];
  error_message?: string;
}

export interface GoogleGeocodeResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type: string;
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  types: string[];
}