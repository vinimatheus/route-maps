import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { origin, waypoints } = await req.json();
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const waypointsStr = waypoints
    .map((point: { lat: number; lng: number }) => `${point.lat},${point.lng}`)
    .join("|");

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${origin.lat},${origin.lng}&waypoints=optimize:true|${waypointsStr}&region=BR&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json(data);
}
