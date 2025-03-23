/**
 * Route Optimizer
 * Implementa algoritmos para otimização de rotas de entrega
 */

import type { RouteAddress } from "./route-manager"

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine
 * Esta fórmula considera a curvatura da Terra para calcular distâncias precisas
 * @param lat1 Latitude do ponto 1
 * @param lng1 Longitude do ponto 1
 * @param lat2 Latitude do ponto 2
 * @param lng2 Longitude do ponto 2
 * @returns Distância em quilômetros
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Raio da Terra em km
  const R = 6371

  // Converter coordenadas de graus para radianos
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  // Fórmula de Haversine
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

/**
 * Converte graus para radianos
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Algoritmo do Vizinho Mais Próximo (Nearest Neighbor)
 * Um algoritmo guloso que sempre escolhe o próximo ponto mais próximo
 * @param origin Ponto de origem
 * @param addresses Lista de endereços a serem ordenados
 * @returns Lista de endereços ordenados pelo caminho mais curto
 */
export function optimizeRouteNearestNeighbor(origin: RouteAddress, addresses: RouteAddress[]): RouteAddress[] {
  if (!origin || !addresses.length) return []

  // Cria uma cópia dos endereços para não modificar o original
  const unvisitedAddresses = [...addresses]
  const optimizedRoute: RouteAddress[] = []

  // Ponto atual começa na origem
  let currentPoint = {
    lat: origin.lat!,
    lng: origin.lng!,
  }

  // Enquanto houver endereços não visitados
  while (unvisitedAddresses.length > 0) {
    // Encontra o endereço mais próximo do ponto atual
    let nearestIndex = 0
    let shortestDistance = Number.MAX_VALUE

    for (let i = 0; i < unvisitedAddresses.length; i++) {
      const address = unvisitedAddresses[i]
      const distance = calculateDistance(currentPoint.lat, currentPoint.lng, address.lat!, address.lng!)

      if (distance < shortestDistance) {
        shortestDistance = distance
        nearestIndex = i
      }
    }

    // Adiciona o endereço mais próximo à rota otimizada
    const nearestAddress = unvisitedAddresses.splice(nearestIndex, 1)[0]
    optimizedRoute.push(nearestAddress)

    // Atualiza o ponto atual
    currentPoint = {
      lat: nearestAddress.lat!,
      lng: nearestAddress.lng!,
    }
  }

  // Atualiza a ordem de entrega
  return optimizedRoute.map((address, index) => ({
    ...address,
    deliveryOrder: index + 1,
  }))
}

/**
 * Calcula a distância total de uma rota
 * @param origin Ponto de origem
 * @param addresses Lista de endereços na ordem da rota
 * @param returnToOrigin Se deve retornar à origem no final
 * @returns Distância total em quilômetros
 */
export function calculateTotalRouteDistance(
  origin: RouteAddress,
  addresses: RouteAddress[],
  returnToOrigin = false,
): number {
  if (!origin || !addresses.length) return 0

  let totalDistance = 0
  let previousPoint = { lat: origin.lat!, lng: origin.lng! }

  // Calcula a distância entre cada ponto da rota
  for (const address of addresses) {
    const distance = calculateDistance(previousPoint.lat, previousPoint.lng, address.lat!, address.lng!)
    totalDistance += distance
    previousPoint = { lat: address.lat!, lng: address.lng! }
  }

  // Se deve retornar à origem, adiciona a distância do último ponto até a origem
  if (returnToOrigin) {
    totalDistance += calculateDistance(previousPoint.lat, previousPoint.lng, origin.lat!, origin.lng!)
  }

  return totalDistance
}

