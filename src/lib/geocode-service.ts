import type { GoogleGeocodeResponse } from "@/types/google-maps";

interface GeocodingResult {
  lat: number;
  lng: number;
  description: string;
}

interface BrasilApiCepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
  location?: {
    type: string;
    coordinates: {
      longitude: string;
      latitude: string;
    };
  };
}

export async function fetchCepData(cep: string): Promise<GeocodingResult | null> {
  try {
    if (!cep || !/^\d{5}-?\d{3}$/.test(cep)) {
      return null;
    }

    const normalizedCep = cep.replace("-", "");
    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${normalizedCep}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "router-maps-app/1.0",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as BrasilApiCepResponse;

    if (
      data.location &&
      data.location.coordinates &&
      data.location.coordinates.latitude &&
      data.location.coordinates.longitude
    ) {
      return {
        lat: Number.parseFloat(data.location.coordinates.latitude),
        lng: Number.parseFloat(data.location.coordinates.longitude),
        description: formatAddressDescription(data),
      };
    }

    const addressString = formatAddressForGeocoding(data);
    return await geocodeAddressWithGoogleAPI(addressString);
  } catch {
    return null;
  }
}

function formatAddressDescription(data: BrasilApiCepResponse): string {
  return `${data.street || ""}, ${data.neighborhood || ""}, ${data.city} - ${data.state}`;
}

function formatAddressForGeocoding(data: BrasilApiCepResponse): string {
  return `${data.street || ""}, ${data.neighborhood || ""}, ${data.city} - ${data.state}, ${data.cep}`;
}

async function geocodeAddressWithGoogleAPI(address: string): Promise<GeocodingResult | null> {
  try {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    let retries = 0;
    const maxRetries = 3;

    while (retries <= maxRetries) {
      try {
        const geocodeResponse = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (geocodeResponse.status === 429) {
          retries++;
          if (retries <= maxRetries) {
            const waitTime = Math.pow(2, retries) * 1000;
            await delay(waitTime);
            continue;
          } else {
            throw new Error("Limite de requisições excedido.");
          }
        }

        if (!geocodeResponse.ok) {
          throw new Error(`Erro HTTP: ${geocodeResponse.status}`);
        }

        const geocodeData = (await geocodeResponse.json()) as GoogleGeocodeResponse;

        if (geocodeData.results && geocodeData.results.length > 0) {
          const location = geocodeData.results[0].geometry.location;
          const formattedAddress = geocodeData.results[0].formatted_address || address;

          return {
            lat: location.lat,
            lng: location.lng,
            description: formattedAddress,
          };
        }

        return null;
      } catch {
        if (retries >= maxRetries) {
          return null;
        }
        retries++;
        await delay(Math.pow(2, retries) * 1000);
      }
    }

    return null;
  } catch {
    return null;
  }
}
