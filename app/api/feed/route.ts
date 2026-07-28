import { NextRequest, NextResponse } from "next/server";
import { getFeed } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";

  try {
    const items = await getFeed({ forceRefresh });
    return NextResponse.json({ items });
  } catch (err: any) {
    const isRateLimited = err?.code === "rate_limited";
    const message = isRateLimited
      ? "Notion está muy ocupado en este momento. Intenta de nuevo en unos segundos."
      : "No se pudo cargar el feed. Revisa que la integración de Notion tenga acceso a las bases de datos.";

    console.error("[api/feed]", err?.message ?? err);
    return NextResponse.json({ error: message }, { status: isRateLimited ? 429 : 500 });
  }
}
