import type { ReactNode } from "react";
import "./globals.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Factory app" };

export default function RootLayout({ children }: { children: ReactNode }) {
  const sf = { expires: process.env.SF_EXPIRES ?? "", env: process.env.SF_ENV ?? "local" };
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `window.SF=${JSON.stringify(sf)};` }} />
        <script src="/sf-banner.js" />
      </head>
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
