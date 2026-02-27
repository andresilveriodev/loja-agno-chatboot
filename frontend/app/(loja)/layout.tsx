import Link from "next/link";
import { Header } from "../components/Layout/Header";
import { Footer } from "../components/Layout/Footer";
import { ChatButton } from "../components/ChatWidget/ChatButton";
import { ChatWindow } from "../components/ChatWidget/ChatWindow";

export default function LojaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--lm-bg)] text-[var(--lm-text)]">
      <Link href="#main-content" className="lm-skip-link">
        Pular para o conteúdo
      </Link>
      <Header />
      <main id="main-content" className="flex-1 max-w-lm-main mx-auto w-full mt-24 mb-16 px-4 pb-16 md:mt-[96px] md:mb-16">
        {children}
      </main>
      <Footer />
      <ChatButton />
      <ChatWindow />
    </div>
  );
}
