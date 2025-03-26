interface LatLng {
  lat: number;
  lng: number;
}

export async function fetchGoogleDirections({
  origin,
  waypoints,
}: {
  origin: LatLng;
  waypoints: LatLng[];
}): Promise<LatLng[]> {
  const response = await fetch("/api/google-directions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origin,
      waypoints,
    }),
  });

  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(`Erro na rota Google: ${data.status}`);
  }

  const overview = data.routes[0].overview_polyline.points;
  const polyline = (await import("@mapbox/polyline")).default;
  const decodedPath = polyline.decode(overview);

  return decodedPath.map(([lat, lng]) => ({
    lat,
    lng,
  }));
}
