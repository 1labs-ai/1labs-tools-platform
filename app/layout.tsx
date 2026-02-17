import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI Tools for Product Teams | 1Labs.ai",
  description: "Free AI-powered tools to accelerate your product development. Generate roadmaps, PRDs, pitch decks and more in seconds.",
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
  openGraph: {
    title: "AI Tools for Product Teams | 1Labs.ai",
    description: "Free AI-powered tools to accelerate your product development.",
    siteName: "1Labs.ai Tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tools for Product Teams | 1Labs.ai",
    description: "Free AI-powered tools to accelerate your product development.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className={`${inter.className} bg-white text-[#131314] min-h-screen flex flex-col antialiased`}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
