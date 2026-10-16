import { NextResponse } from "next/server";
import { getMatchesForProduction } from "@/lib/matches-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getMatchesForProduction();
    const status = data.error && data.matches.length === 0 ? 503 : 200;
    return NextResponse.json(data, {
      status,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json(
      {
        matches: [],
        source: "none",
        lastUpdated: new Date().toISOString(),
        error: message,
      },
      { status: 500 }
    );
  }
}
