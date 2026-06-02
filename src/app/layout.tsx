import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@/components/providers/QueryClientProvider";
import { FirebaseProvider } from "@/components/providers/FirebaseProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicLens SA — Public Sector Intelligence Platform",
  description:
    "South Africa's premier public-sector intelligence platform. Municipal finance, procurement analytics, service delivery monitoring, and risk intelligence for 257 municipalities.",
  keywords: [
    "CivicLens",
    "South Africa",
    "municipal intelligence",
    "procurement analytics",
    "public sector",
    "government data",
    "tender intelligence",
    "service delivery",
    "municipal finance",
  ],
  authors: [{ name: "CivicLens SA" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "CivicLens SA — Public Sector Intelligence Platform",
    description:
      "Intelligence-driven insights into South Africa's 257 municipalities, R478B+ in active tenders, and real-time risk signals.",
    siteName: "CivicLens SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CivicLens SA — Public Sector Intelligence Platform",
    description:
      "Intelligence-driven insights into South Africa's municipalities and public procurement.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseProvider>
            <QueryClientProvider>
              {children}
              <Toaster />
            </QueryClientProvider>
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
