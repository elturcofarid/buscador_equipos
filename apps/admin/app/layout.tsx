import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin | Buscador Futbol",
  description: "Panel administrativo del MVP"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
