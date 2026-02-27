import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "./components/Layout/Header";
import { Footer } from "./components/Layout/Footer";
import { ChatButton } from "./components/ChatWidget/ChatButton";
import { ChatWindow } from "./components/ChatWidget/ChatWindow";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Loja Multidepartamental | Catálogo de Produtos Industriais",
  description:
    "Catálogo de equipamentos industriais e profissionais: ferramentas, energia, climatização, cozinha industrial, EPIs e mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans text-primary-900 antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
