/**
 * Route Manager
 * Responsável por gerenciar as rotas e endereços da aplicação
 */

export interface RouteAddress {
  id: string;
  description: string;
  lat?: number;
  lng?: number;
  isGeocoded: boolean;
  deliveryOrder?: number; // Número da ordem de entrega
  isChecked?: boolean; // Status de entrega (checklist)
}

/**
 * Reordena os endereços com base na ordem de entrega
 */
export function sortAddressesByDeliveryOrder(addresses: RouteAddress[]): RouteAddress[] {
  return [...addresses].sort((a, b) => {
    // Se ambos têm deliveryOrder, ordena por ele
    if (a.deliveryOrder !== undefined && b.deliveryOrder !== undefined) {
      return a.deliveryOrder - b.deliveryOrder;
    }
    // Se apenas um tem deliveryOrder, coloca o que tem na frente
    if (a.deliveryOrder !== undefined) return -1;
    if (b.deliveryOrder !== undefined) return 1;
    // Se nenhum tem, mantém a ordem original
    return 0;
  });
}

/**
 * Atualiza a ordem de entrega dos endereços
 */
export function updateDeliveryOrder(addresses: RouteAddress[]): RouteAddress[] {
  return addresses.map((address, index) => ({
    ...address,
    deliveryOrder: index + 1,
  }));
}

/**
 * Verifica se todos os endereços foram entregues
 */
export function allDeliveriesCompleted(addresses: RouteAddress[]): boolean {
  return addresses.length > 0 && addresses.every((address) => address.isChecked);
}

/**
 * Cria waypoints para o mapa a partir do ponto de origem e endereços
 */
export function createWaypoints(
  origin: RouteAddress | null,
  addresses: RouteAddress[],
  returnToOrigin: boolean = false
): { lat: number; lng: number }[] {
  if (!origin) return [];
  
  const sortedAddresses = sortAddressesByDeliveryOrder(addresses);
  
  const points = [
    { lat: origin.lat!, lng: origin.lng! },
    ...sortedAddresses.map((addr) => ({ lat: addr.lat!, lng: addr.lng! })),
  ];
  
  // Adiciona o ponto de origem novamente se returnToOrigin for true
  if (returnToOrigin && origin.lat && origin.lng) {
    points.push({ lat: origin.lat, lng: origin.lng });
  }
  
  return points;
}