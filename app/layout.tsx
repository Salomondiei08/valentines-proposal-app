import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "i love you ❤️",
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
      <body>
        {children}
        <footer className="site-footer">
          <p>
            made with ❤️ by{" "}
            <a
              href="https://github.com/Salomondiei08/valentines-proposal-app"
              target="_blank"
              rel="noreferrer"
            >
              Salomon
            </a>
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
