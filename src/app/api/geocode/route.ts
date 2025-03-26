import { type NextRequest, NextResponse } from "next/server"
import type { GoogleGeocodeResponse } from "@/types/google-maps"

const CACHE_TTL = 1000 * 60 * 60 // 1 hora
const geocodeCache = new Map<string, { data: GoogleGeocodeResponse; timestamp: number }>()
const requestCounts = new Map<string, { count: number; timestamp: number; resetTime?: number }>()

// Função auxiliar para validar o endereço
function isValidAddress(address: string): boolean {
  // Remove caracteres especiais e verifica comprimento mínimo
  const sanitized = address.replace(/[^\w\s-]/g, '').trim()
  return sanitized.length >= 3 && sanitized.length <= 200
}

export async function GET(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Validação básica de User-Agent
    if (!userAgent || userAgent === "unknown") {
      return NextResponse.json({ error: "Invalid request" }, { 
        status: 400,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Content-Security-Policy': "default-src 'none'",
        }
      })
    }

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
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
          },
        },
      )
    }

    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: "Endereço inválido ou muito curto" }, 
        { 
          status: 400,
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
          }
        }
      )
    }

    const cacheKey = address.toLowerCase().trim()
    const cachedResult = geocodeCache.get(cacheKey)
    
    if (cachedResult) {
      // Verifica se o cache ainda é válido
      if (Date.now() - cachedResult.timestamp < CACHE_TTL) {
        return NextResponse.json(cachedResult.data, {
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Cache-Control': 'private, max-age=3600',
          }
        })
      } else {
        geocodeCache.delete(cacheKey)
      }
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("Google Maps API key is not configured")
      return NextResponse.json(
        { error: "API configuration error" }, 
        { 
          status: 500,
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
          }
        }
      )
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

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

    if (data.status !== "OK") {
      console.error("Google Geocoding API error:", data.status, data.error_message)

      const errorResponse: GoogleGeocodeResponse = {
        status: data.status,
        results: [],
        error_message: data.error_message || "Endereço não encontrado",
      }

      geocodeCache.set(cacheKey, { data: errorResponse, timestamp: Date.now() })

      return NextResponse.json(errorResponse, { 
        status: 200,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Cache-Control': 'private, max-age=3600',
        }
      })
    }

    geocodeCache.set(cacheKey, { data, timestamp: Date.now() })

    // Limpa cache antigo se necessário
    if (geocodeCache.size > 100) {
      const now = Date.now()
      for (const [key, value] of geocodeCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          geocodeCache.delete(key)
        }
      }
    }

    return NextResponse.json(data, {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'private, max-age=3600',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      }
    })
  } catch (error: unknown) {
    console.error("Error geocoding address:", error)

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout. Please try again." }, { status: 408 })
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to geocode address", details: errorMessage }, { status: 500 })
  }
}

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = requestCounts.get(key) || { count: 0, timestamp: now }

  if (now - record.timestamp > windowMs) {
    record.count = 1
    record.timestamp = now
    requestCounts.set(key, record)
    return true
  }

  record.count++
  requestCounts.set(key, record)

  if (record.count > limit) {
    record.resetTime = record.timestamp + windowMs
    requestCounts.set(key, record)
  }

  return record.count <= limit
}
