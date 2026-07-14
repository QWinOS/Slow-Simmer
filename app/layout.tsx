import type { Metadata } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { site } from "@/lib/site-config";

// Bodoni Moda — high-contrast display serif for headings (luxury, editorial)
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
});

// Jost — refined geometric sans for body (calm, contemporary)
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

const seoTitle =
  process.env.NEXT_PUBLIC_SEO_TITLE?.trim() ||
  `${site.brand.name} | Supper Club in ${site.hero.cities}`;

const seoDescription =
  process.env.NEXT_PUBLIC_SEO_DESCRIPTION?.trim() ||
  `Seasonal supper club events in ${site.hero.cities}. Intimate gatherings with curated menus, shared tables, and evenings made to linger. ${site.hero.seats} guests.`;

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
  metadataBase: new URL(site.url),
  openGraph: {
    title: seoTitle,
    description: seoDescription,
    url: "/",
    siteName: site.brand.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.brand.name,
    description: seoDescription,
    url: site.url,
    areaServed: ["Kolkata", "Bangalore"],
    sameAs: Object.values(site.social).filter(Boolean),
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased overflow-x-hidden",
        bodoniModa.variable,
        jost.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
