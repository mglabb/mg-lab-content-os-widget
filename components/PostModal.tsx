"use client";

import type { FeedItem } from "@/lib/notion";

export default function PostModal({ item, onClose }: { item: FeedItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-square w-full bg-line md:w-1/2">
          {item.coverImageUrl ? (
            <img src={item.coverImageUrl} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-ink/40">
              Sin imagen
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 p-6 md:w-1/2">
          <button
            onClick={onClose}
            className="self-end text-sm text-ink/50 transition hover:text-ink"
            aria-label="Cerrar"
          >
            Cerrar ✕
          </button>

          <h2 className="text-lg font-medium leading-snug">{item.title}</h2>

          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink/60">
              {item.contentType}
            </span>
            <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink/60">
              {item.status}
            </span>
            {item.category && (
              <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink/60">
                {item.category}
              </span>
            )}
          </div>

          {item.publishDate && (
            <p className="text-sm text-ink/50">
              {new Date(`${item.publishDate}T12:00:00`).toLocaleDateString("es", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          {item.caption && <p className="whitespace-pre-line text-sm text-ink/80">{item.caption}</p>}
        </div>
      </div>
    </div>
  );
}
