import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Outfit, Doto } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const doto = Doto({
  subsets: ["latin"],
  variable: "--font-doto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DotIcon Gallery",
  description: "Premium ASCII and dot-matrix inspired icons for your next modern web application.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value ?? "dark";

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${doto.variable} h-full antialiased ${theme === "dark" ? "dark" : ""}`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
