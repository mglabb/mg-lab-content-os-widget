"use client";

import { useEffect, useMemo, useState } from "react";
import type { FeedItem } from "@/lib/notion";
import ProfileHeader from "@/components/ProfileHeader";
import PostModal from "@/components/PostModal";

type Tab = "grid" | "reels";

const TYPE_ICON: Record<string, string> = {
  Reel: "▶",
  Carrusel: "▦",
};

export default function Page() {
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("grid");
  const [planGridActive, setPlanGridActive] = useState(false);
  const [activeItem, setActiveItem] = useState<FeedItem | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const loadFeed = (forceRefresh = false) => {
    setError(null);
    if (forceRefresh) setRefreshing(true);
    fetch(`/api/feed${forceRefresh ? "?refresh=1" : ""}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error desconocido");
        setItems(data.items);
      })
      .catch((err) => setError(err.message))
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const visibleItems = useMemo(() => {
    if (!items) return [];
    return tab === "reels" ? items.filter((i) => i.contentType === "Reel") : items;
  }, [items, tab]);

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId || !items) return;
    const from = items.findIndex((i) => i.id === draggedId);
    const to = items.findIndex((i) => i.id === targetId);
    if (from === -1 || to === -1) return;

    const reordered = [...items];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const withOrder = reordered.map((item, index) => ({ ...item, order: index + 1 }));
    setItems(withOrder);
    setDraggedId(null);

    fetch("/api/feed/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        updates: withOrder.map((i) => ({ id: i.id, order: i.order })),
      }),
    }).catch(() => setError("No se pudo guardar el nuevo orden en Notion."));
  }

  return (
    <main className="mx-auto min-h-screen max-w-md">
      <div className="my-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <ProfileHeader
          handle={process.env.NEXT_PUBLIC_PROFILE_HANDLE || "@tumarca"}
          bio={process.env.NEXT_PUBLIC_PROFILE_BIO || ""}
          avatarUrl={process.env.NEXT_PUBLIC_PROFILE_AVATAR_URL || ""}
          onRefresh={() => loadFeed(true)}
          refreshing={refreshing}
          planGridActive={planGridActive}
          onTogglePlanGrid={() => setPlanGridActive((v) => !v)}
        />

        <div className="flex border-t border-line">
          <button
            onClick={() => setTab("grid")}
            className={`flex-1 border-b-2 py-2.5 text-xs font-medium tracking-wide ${
              tab === "grid" ? "border-ink text-ink" : "border-transparent text-ink/40"
            }`}
          >
            ▦ GRID
          </button>
          <button
            onClick={() => setTab("reels")}
            className={`flex-1 border-b-2 py-2.5 text-xs font-medium tracking-wide ${
              tab === "reels" ? "border-ink text-ink" : "border-transparent text-ink/40"
            }`}
          >
            ▶ REELS
          </button>
        </div>

        {error && <div className="p-4 text-center text-xs text-red-600">{error}</div>}

        {!items && !error && (
          <div className="grid grid-cols-3 gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse bg-line" />
            ))}
          </div>
        )}

        {items && visibleItems.length === 0 && (
          <div className="px-6 py-14 text-center text-xs text-ink/40">
            Todavía no hay publicaciones aquí. Agrega una en Notion y va a aparecer sola.
          </div>
        )}

        {items && visibleItems.length > 0 && (
          <div className="grid grid-cols-3 gap-0.5">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                draggable={planGridActive}
                onDragStart={() => setDraggedId(item.id)}
                onDragOver={(e) => planGridActive && e.preventDefault()}
                onDrop={() => handleDrop(item.id)}
                onClick={() => !planGridActive && setActiveItem(item)}
                className={`group relative aspect-square overflow-hidden bg-line ${
                  planGridActive ? "cursor-grab active:cursor-grabbing" : ""
                } ${draggedId === item.id ? "opacity-40" : ""}`}
              >
                {item.coverImageUrl ? (
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-2 text-center text-[11px] text-ink/40">
                    {item.title}
                  </div>
                )}
                {TYPE_ICON[item.contentType] && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                    {TYPE_ICON[item.contentType]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeItem && <PostModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </main>
  );
}
