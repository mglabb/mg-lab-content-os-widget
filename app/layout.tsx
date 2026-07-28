import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MG Lab Content OS — Vista previa del feed",
  description: "Vista previa del feed de contenido conectada a Notion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-paper text-ink">{children}</body>
    </html>
  );
}
