import type { RouteAddress } from "./route-manager"

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function optimizeRouteNearestNeighbor(origin: RouteAddress, addresses: RouteAddress[]): RouteAddress[] {
  if (!origin || !addresses.length) return []
  const unvisitedAddresses = [...addresses]
  const optimizedRoute: RouteAddress[] = []
  let currentPoint = { lat: origin.lat!, lng: origin.lng! }

  while (unvisitedAddresses.length > 0) {
    let nearestIndex = 0
    let shortestDistance = Number.MAX_VALUE

    for (let i = 0; i < unvisitedAddresses.length; i++) {
      const address = unvisitedAddresses[i]
      // Calcular distância considerando barreiras geográficas
      const distance = calculateGeographicallyAwareDistance(currentPoint.lat, currentPoint.lng, address.lat!, address.lng!)
      if (distance < shortestDistance) {
        shortestDistance = distance
        nearestIndex = i
      }
    }

    const nearestAddress = unvisitedAddresses.splice(nearestIndex, 1)[0]
    optimizedRoute.push(nearestAddress)
    currentPoint = { lat: nearestAddress.lat!, lng: nearestAddress.lng! }
  }

  return optimizedRoute.map((address, index) => ({
    ...address,
    deliveryOrder: index + 1,
  }))
}

// Função que considera barreiras geográficas para calcular distâncias mais realistas
export function calculateGeographicallyAwareDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Calcular a distância básica usando Haversine
  const baseDistance = calculateDistance(lat1, lng1, lat2, lng2)
  
  // Verificar se os pontos estão em regiões que exigem considerações especiais
  // Exemplo: Macapá e Manaus são separados pelo Rio Amazonas e floresta densa
  const isMacapaToManaus = isBetweenRegions(lat1, lng1, lat2, lng2, 
    { lat: 0.0356, lng: -51.0705 }, // Aproximadamente Macapá
    { lat: -3.1190, lng: -60.0217 }  // Aproximadamente Manaus
  )
  
  if (isMacapaToManaus) {
    // Aplicar um fator de correção para considerar a rota real por estradas/rios
    return baseDistance * 1.8 // Aumenta a "distância efetiva" em 80%
  }
  
  // Verificar outras regiões problemáticas e aplicar fatores de correção
  // Adicionar mais verificações conforme necessário para outras regiões
  
  return baseDistance
}

// Função auxiliar para verificar se dois pontos estão entre duas regiões específicas
function isBetweenRegions(
  lat1: number, lng1: number, 
  lat2: number, lng2: number,
  regionA: {lat: number, lng: number},
  regionB: {lat: number, lng: number}
): boolean {
  // Verificar se os pontos estão próximos das regiões especificadas
  const isPoint1NearRegionA = calculateDistance(lat1, lng1, regionA.lat, regionA.lng) < 100
  const isPoint2NearRegionA = calculateDistance(lat2, lng2, regionA.lat, regionA.lng) < 100
  const isPoint1NearRegionB = calculateDistance(lat1, lng1, regionB.lat, regionB.lng) < 100
  const isPoint2NearRegionB = calculateDistance(lat2, lng2, regionB.lat, regionB.lng) < 100
  
  // Se um ponto está próximo de A e outro próximo de B, então estão entre as regiões
  return (isPoint1NearRegionA && isPoint2NearRegionB) || (isPoint1NearRegionB && isPoint2NearRegionA)
}

export function calculateTotalRouteDistance(
  origin: RouteAddress,
  addresses: RouteAddress[],
  returnToOrigin = false,
): number {
  if (!origin || !addresses.length) return 0
  let totalDistance = 0
  let previousPoint = { lat: origin.lat!, lng: origin.lng! }

  for (const address of addresses) {
    // Usar a função que considera barreiras geográficas
    const distance = calculateGeographicallyAwareDistance(previousPoint.lat, previousPoint.lng, address.lat!, address.lng!)
    totalDistance += distance
    previousPoint = { lat: address.lat!, lng: address.lng! }
  }

  if (returnToOrigin) {
    // Usar a função que considera barreiras geográficas para o retorno
    totalDistance += calculateGeographicallyAwareDistance(previousPoint.lat, previousPoint.lng, origin.lat!, origin.lng!)
  }

  return totalDistance
}
