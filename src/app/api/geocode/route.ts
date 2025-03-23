import { type NextRequest, NextResponse } from "next/server"
import type { GoogleGeocodeResponse } from "@/types/google-maps"

// Cache para armazenar resultados de geocodificação e reduzir chamadas à API
const geocodeCache = new Map<string, GoogleGeocodeResponse>()
// Contador para limitar taxa de requisições
const requestCounts = new Map<string, { count: number; timestamp: number; resetTime?: number }>()

/**
 * Função para geocodificar endereços usando a API do Google Maps
 * Implementa cache, validação de entrada e limitação de taxa
 */
export async function GET(request: NextRequest) {
  try {
    // Obter IP do cliente para limitação de taxa
    const clientIp = request.headers.get("x-forwarded-for") || "unknown"

    // Verificar limitação de taxa (máximo de 20 requisições por minuto por IP)
    // Aumentado de 10 para 20 para permitir mais requisições
    if (!checkRateLimit(clientIp, 20, 60000)) {
      const record = requestCounts.get(clientIp)
      const resetTime = record?.resetTime || Date.now() + 60000
      const secondsToReset = Math.ceil((resetTime - Date.now()) / 1000)

      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          resetIn: secondsToReset,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(secondsToReset),
          },
        },
      )
    }

    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")

    // Validação de entrada
    if (!address || address.trim().length < 3) {
      return NextResponse.json({ error: "Address is required and must be at least 3 characters" }, { status: 400 })
    }

    // Verificar se o resultado está em cache
    const cacheKey = address.toLowerCase().trim()
    if (geocodeCache.has(cacheKey)) {
      return NextResponse.json(geocodeCache.get(cacheKey))
    }

    // Obter a chave da API do ambiente
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("Google Maps API key is not configured")
      return NextResponse.json({ error: "API configuration error" }, { status: 500 })
    }

    // Construir URL com parâmetros sanitizados
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`

    // Fazer a requisição com timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos de timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "router-maps-app/1.0",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()

    // Tratar diferentes status da API do Google Maps
    if (data.status !== "OK") {
      console.error("Google Geocoding API error:", data.status, data.error_message)
      
      const errorResponse: GoogleGeocodeResponse = {
        status: data.status,
        results: [],
        error_message: data.error_message || "Endereço não encontrado"
      }

      // Cache resultados negativos para evitar requisições repetidas
      geocodeCache.set(cacheKey, errorResponse)

      return NextResponse.json(errorResponse, { status: 200 })
    }

    // Armazenar resultado em cache
    geocodeCache.set(cacheKey, data)

    // Limitar o tamanho do cache (máximo 100 entradas)
    if (geocodeCache.size > 100) {
      const iterator = geocodeCache.keys()
      const firstKey = iterator.next().value
      if (firstKey) {
        geocodeCache.delete(firstKey)
      }
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error("Error geocoding address:", error)

    // Tratamento específico para timeout
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout. Please try again." }, { status: 408 })
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to geocode address", details: errorMessage }, { status: 500 })
  }
}

/**
 * Função para verificar limitação de taxa
 * @param key Identificador único (IP do cliente)
 * @param limit Número máximo de requisições permitidas no período
 * @param windowMs Período de tempo em milissegundos
 * @returns Booleano indicando se a requisição está dentro do limite
 */
function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = requestCounts.get(key) || { count: 0, timestamp: now }

  // Resetar contador se o período expirou
  if (now - record.timestamp > windowMs) {
    record.count = 1
    record.timestamp = now
    requestCounts.set(key, record)
    return true
  }

  // Incrementar contador e verificar limite
  record.count++
  requestCounts.set(key, record)

  // Se exceder o limite, adiciona um timestamp para quando o limite será resetado
  if (record.count > limit) {
    record.resetTime = record.timestamp + windowMs
    requestCounts.set(key, record)
  }

  return record.count <= limit
}

