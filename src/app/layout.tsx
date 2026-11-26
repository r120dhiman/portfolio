import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { Preloader } from "@/components/fx/Preloader";
import { Cursor } from "@/components/fx/Cursor";
import { CookieBar } from "@/components/fx/CookieBar";
import { Nav } from "@/components/layout/Nav";
import { TechLayer } from "@/components/tech/TechLayer";
import { Footer } from "@/components/layout/Footer";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Software Engineer`, template: `%s — ${site.name}` },
  description: site.tagline,
  alternates: { canonical: "/" },
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  openGraph: { type: "website", siteName: site.name, url: site.url },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0b0b0a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}>
      <body className="min-h-dvh">
        <SiteJsonLd />
        <SmoothScroll>
          <Preloader />
          <Cursor />
          <Nav />
          <CookieBar />
          <TechLayer />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
