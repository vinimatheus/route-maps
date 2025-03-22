export interface NominatimResult {
  place_id: string
  description: string
  lat: number
  lng: number
}

interface NominatimApiResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const autocompleteNominatim = async (query: string): Promise<NominatimResult[]> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
  )
  const data = await response.json() as NominatimApiResult[]

  return data.map((result) => ({
    place_id: result.place_id.toString(),
    description: result.display_name,
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
  }))
}

export const geocodeNominatim = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
  )
  const data = await response.json()

  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    }
  }

  return null
}
