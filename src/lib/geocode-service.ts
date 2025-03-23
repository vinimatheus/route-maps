/**
 * Geocode Service
 * Serviço responsável por gerenciar a geocodificação de endereços
 * Implementa boas práticas de segurança e clean code
 */

import type { GoogleGeocodeResponse } from "@/types/google-maps"

interface GeocodingResult {
  lat: number
  lng: number
  description: string
}

/**
 * Interface para os dados retornados pela Brasil API
 */
interface BrasilApiCepResponse {
  cep: string
  state: string
  city: string
  neighborhood: string
  street: string
  service: string
  location?: {
    type: string
    coordinates: {
      longitude: string
      latitude: string
    }
  }
}

/**
 * Busca dados de CEP usando a Brasil API e faz fallback para Google Maps se necessário
 */
export async function fetchCepData(cep: string): Promise<GeocodingResult | null> {
  try {
    // Validação básica do CEP
    if (!cep || !/^\d{5}-?\d{3}$/.test(cep)) {
      console.error("CEP inválido:", cep)
      return null
    }

    // Normaliza o CEP removendo o hífen
    const normalizedCep = cep.replace("-", "")

    // Busca na Brasil API
    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${normalizedCep}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "router-maps-app/1.0",
      },
    })

    if (!response.ok) {
      console.error("Erro ao buscar CEP na Brasil API:", response.status)
      return null
    }

    const data = (await response.json()) as BrasilApiCepResponse

    // Verifica se temos coordenadas válidas da Brasil API
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
      }
    }

    // Se não tiver coordenadas, usa Google API como fallback
    const addressString = formatAddressForGeocoding(data)
    return await geocodeAddressWithGoogleAPI(addressString)
  } catch (error) {
    console.error("Erro ao buscar CEP:", error)
    return null
  }
}

/**
 * Formata a descrição do endereço a partir dos dados da Brasil API
 */
function formatAddressDescription(data: BrasilApiCepResponse): string {
  return `${data.street || ""}, ${data.neighborhood || ""}, ${data.city} - ${data.state}`
}

/**
 * Formata o endereço para geocodificação
 */
function formatAddressForGeocoding(data: BrasilApiCepResponse): string {
  return `${data.street || ""}, ${data.neighborhood || ""}, ${data.city} - ${data.state}, ${data.cep}`
}

/**
 * Geocodifica um endereço usando a API do Google Maps
 * Implementa rate limiting e retry logic para evitar erros 429
 */
async function geocodeAddressWithGoogleAPI(address: string): Promise<GeocodingResult | null> {
  try {
    // Função para atrasar a execução - ajuda com rate limiting
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    // Tenta geocodificar com até 3 retentativas
    let retries = 0
    const maxRetries = 3

    while (retries <= maxRetries) {
      try {
        // Usa a API interna para evitar expor a chave da API no cliente
        const geocodeResponse = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`, {
          headers: {
            Accept: "application/json",
          },
        })

        // Se receber 429 (Too Many Requests), espera e tenta novamente
        if (geocodeResponse.status === 429) {
          retries++
          if (retries <= maxRetries) {
            // Espera exponencialmente mais tempo a cada tentativa
            const waitTime = Math.pow(2, retries) * 1000
            console.log(`Rate limit atingido. Aguardando ${waitTime}ms antes de tentar novamente...`)
            await delay(waitTime)
            continue
          } else {
            throw new Error("Limite de requisições excedido. Tente novamente mais tarde.")
          }
        }

        if (!geocodeResponse.ok) {
          throw new Error(`Erro HTTP: ${geocodeResponse.status}`)
        }

        const geocodeData = (await geocodeResponse.json()) as GoogleGeocodeResponse

        if (geocodeData.results && geocodeData.results.length > 0) {
          const location = geocodeData.results[0].geometry.location
          const formattedAddress = geocodeData.results[0].formatted_address || address

          return {
            lat: location.lat,
            lng: location.lng,
            description: formattedAddress,
          }
        }

        return null
      } catch (error) {
        // Se for o último retry, propaga o erro
        if (retries >= maxRetries) {
          throw error
        }

        // Caso contrário, incrementa o contador e tenta novamente
        retries++
        await delay(Math.pow(2, retries) * 1000)
      }
    }

    return null
  } catch (error) {
    console.error("Erro ao geocodificar endereço:", error)
    return null
  }
}

