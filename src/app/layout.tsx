import type { Metadata } from "next";
import { Bricolage_Grotesque, Outfit, Caveat, Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import fs from "fs";
import path from "path";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import AsciiBackground from "@/components/ascii-background";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://omkaarshenoy.com"),
  title: {
    default: "Omkaar Shenoy | Data Engineer",
    template: "%s | Omkaar Shenoy"
  },
  description: "Omkaar Shenoy is a Data Engineer based in Philadelphia building data infrastructure at scale. Specialized in Snowflake, dbt, Azure, and Python.",
  keywords: ["Data Engineer", "Philadelphia", "Omkaar Shenoy", "Snowflake", "dbt", "Azure", "Python", "Data Infrastructure", "Software Engineer"],
  icons: {
    icon: "/images/favicon.png",
  },
  authors: [{ name: "Omkaar Shenoy", url: "https://omkaarshenoy.com" }],
  creator: "Omkaar Shenoy", 
  openGraph: {
    title: "Omkaar Shenoy | Data Engineer",
    description: "Data Engineer based in Philadelphia building data infrastructure at scale.",
    url: "https://omkaarshenoy.com",
    siteName: "Omkaar Shenoy Portfolio",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Omkaar Shenoy - Data Engineer Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omkaar Shenoy | Data Engineer",
    description: "Data Engineer based in Philadelphia building data infrastructure at scale.",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Omkaar Shenoy",
    "jobTitle": "Data Engineer",
    "url": "https://omkaarshenoy.com",
    "sameAs": [
      "https://linkedin.com/in/omkaarshenoy",
      "https://github.com/omkaarshenoy"
    ],
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "Arizona State University"
    },
    "worksFor": {
      "@type": "Organization",
      "name": "Aramark"
    },
    "description": "Omkaar Shenoy is a Data Engineer based in Philadelphia building data infrastructure at scale.",
    "image": "https://omkaarshenoy.com/images/og-image.png",
    "knowsAbout": ["Data Engineering", "Data Infrastructure", "Snowflake", "dbt", "Azure", "Python", "SQL", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "Java", "Software Engineering"]
  };

  // Automatically get all images from public/images/backgrounds
  const backgroundsDir = path.join(process.cwd(), "public/images/backgrounds/");
  let backgroundImages: string[] = [];

  try {
    const files = fs.readdirSync(backgroundsDir);
    backgroundImages = files
      .filter(file => /\.(jpe?g|png|webp|svg)$/i.test(file))
      .sort()
      .map(file => `/images/backgrounds/${file}`);
  } catch (error) {
    console.error("Failed to read background images directory:", error);
    // Fallback to defaults if directory read fails
    backgroundImages = [
      "/images/backgrounds/neist.jpeg",
      "/images/backgrounds/oldmanofstorr.jpeg",
      "/images/backgrounds/fuji.png",
    ];
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${bricolage.variable} ${outfit.variable} ${plusJakarta.variable} ${caveat.variable} ${instrumentSerif.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="grain-overlay" />
          <AsciiBackground images={backgroundImages} />
          <div style={{ position: "relative", zIndex: 10 }}>
            {children}
          </div>

          <svg className="hidden">
            <filter id="grainy">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </svg>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
