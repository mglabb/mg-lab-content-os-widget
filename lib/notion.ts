import { Client, APIErrorCode, isNotionClientError } from "@notionhq/client";

export type FeedItem = {
  id: string;
  title: string;
  contentType: string;
  status: string;
  category: string;
  coverImageUrl: string | null;
  caption: string;
  publishDate: string | null;
  published: boolean;
  order: number;
};

const CALENDAR_DB_ID = process.env.NOTION_CALENDAR_DATABASE_ID;
const NOTION_TOKEN = process.env.NOTION_TOKEN;

let cachedFeed: { items: FeedItem[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60_000; // 1 minuto: evita golpear el límite de Notion en cada clic

function getClient() {
  if (!NOTION_TOKEN) {
    throw new Error(
      "Falta NOTION_TOKEN. Configúralo en las variables de entorno del servidor (nunca en el navegador)."
    );
  }
  return new Client({ auth: NOTION_TOKEN });
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimited = isNotionClientError(err) && err.code === APIErrorCode.RateLimited;
      if (isRateLimited && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 800 * attempt));
        continue;
      }
      throw err;
    }
  }
  throw new Error("No se pudo completar la solicitud a Notion tras varios intentos.");
}

function getPlainText(richText: any[] | undefined): string {
  if (!richText || richText.length === 0) return "";
  return richText.map((t) => t.plain_text ?? "").join("");
}

function getFileUrl(filesProp: any): string | null {
  const file = filesProp?.files?.[0];
  if (!file) return null;
  if (file.type === "external") return file.external.url;
  if (file.type === "file") return file.file.url;
  return null;
}

export function invalidateFeedCache() {
  cachedFeed = null;
}

export async function getFeed(options: { forceRefresh?: boolean } = {}): Promise<FeedItem[]> {
  if (!CALENDAR_DB_ID) {
    throw new Error("Falta NOTION_CALENDAR_DATABASE_ID en las variables de entorno.");
  }

  if (!options.forceRefresh && cachedFeed && Date.now() - cachedFeed.fetchedAt < CACHE_TTL_MS) {
    return cachedFeed.items;
  }

  const notion = getClient();
  const items: FeedItem[] = [];
  let cursor: string | undefined = undefined;

  do {
    const page: any = await withRetry(() =>
      notion.databases.query({
        database_id: CALENDAR_DB_ID!,
        start_cursor: cursor,
        page_size: 100,
        sorts: [{ property: "Orden en el feed", direction: "ascending" }],
      })
    );

    for (const row of page.results as any[]) {
      const props = row.properties;
      items.push({
        id: row.id,
        title: getPlainText(props["Título"]?.title) || "Sin título",
        contentType: props["Tipo"]?.select?.name ?? "Otro",
        status: props["Estado"]?.select?.name ?? "Idea",
        category: props["Categoría"]?.select?.name ?? "",
        coverImageUrl: getFileUrl(props["Imagen de portada"]),
        caption: getPlainText(props["Caption"]?.rich_text),
        publishDate: props["Fecha de publicación"]?.date?.start ?? null,
        published: props["Publicado"]?.checkbox ?? false,
        order: props["Orden en el feed"]?.number ?? 0,
      });
    }

    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);

  cachedFeed = { items, fetchedAt: Date.now() };
  return items;
}

export async function updateOrder(updates: { id: string; order: number }[]) {
  const notion = getClient();
  await Promise.all(
    updates.map(({ id, order }) =>
      withRetry(() =>
        notion.pages.update({
          page_id: id,
          properties: { "Orden en el feed": { number: order } },
        })
      )
    )
  );
  invalidateFeedCache();
}
