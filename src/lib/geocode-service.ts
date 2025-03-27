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

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export async function fetchCepData(cep: string): Promise<GeocodingResult | null> {
  try {
    if (!cep || !/^\d{5}-?\d{3}$/.test(cep)) {
      return null;
    }

    const normalizedCep = cep.replace(/\D/g, "");

    const brasilApiResponse = await fetch(`https://brasilapi.com.br/api/cep/v2/${normalizedCep}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "router-maps-app/1.0",
      },
    });

    if (brasilApiResponse.ok) {
      const data = (await brasilApiResponse.json()) as BrasilApiCepResponse;

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
    }

    const viaCepResponse = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`);
    if (viaCepResponse.ok) {
      const data = (await viaCepResponse.json()) as ViaCepResponse;

      if (!data.erro) {
        const address = formatViaCepAddress(data);
        return await geocodeAddressWithGoogleAPI(address);
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar dados de CEP:", error);
    return null;
  }
}

function formatAddressDescription(data: BrasilApiCepResponse): string {
  return `${data.street || ""}, ${data.neighborhood || ""}, ${data.city} - ${data.state}`;
}

function formatAddressForGeocoding(data: BrasilApiCepResponse): string {
  return `${data.street || ""}, ${data.neighborhood || ""}, ${data.city} - ${data.state}, ${data.cep}`;
}

function formatViaCepAddress(data: ViaCepResponse): string {
  return `${data.logradouro || ""}, ${data.bairro || ""}, ${data.localidade} - ${data.uf}, ${data.cep}`;
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
          const waitTime = Math.pow(2, retries) * 1000;
          await delay(waitTime);
          continue;
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
      } catch (error) {
        retries++;
        if (retries > maxRetries) {
          console.error("Erro ao geocodificar com Google:", error);
          return null;
        }

        const waitTime = Math.pow(2, retries) * 1000;
        await delay(waitTime);
      }
    }

    return null;
  } catch (err) {
    console.error("Erro inesperado na geocodificação:", err);
    return null;
  }
}
