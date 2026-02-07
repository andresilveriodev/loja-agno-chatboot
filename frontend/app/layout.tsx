import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./components/Layout/Header";
import { Footer } from "./components/Layout/Footer";
import { ChatButton } from "./components/ChatWidget/ChatButton";
import { ChatWindow } from "./components/ChatWidget/ChatWindow";
import { Providers } from "./providers";

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-white font-sans text-primary-900 antialiased" suppressHydrationWarning>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatButton />
          <ChatWindow />
        </Providers>
      </body>
    </html>
  );
}
