import { NextRequest, NextResponse } from "next/server";
import { updateOrder } from "@/lib/notion";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updates = body.updates as { id: string; order: number }[];
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "Faltan los cambios de orden." }, { status: 400 });
    }
    await updateOrder(updates);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[api/feed/reorder]", err?.message ?? err);
    return NextResponse.json({ error: "No se pudo guardar el nuevo orden en Notion." }, { status: 500 });
  }
}
