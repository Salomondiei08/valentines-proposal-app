import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mon Valentin",
  description: "Une surprise romantique"
};

/**
 * Root layout for the Valentine experience.
 */
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
