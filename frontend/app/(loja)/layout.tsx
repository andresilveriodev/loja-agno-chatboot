import { Header } from "../components/Layout/Header";
import { Footer } from "../components/Layout/Footer";
import { ChatButton } from "../components/ChatWidget/ChatButton";
import { ChatWindow } from "../components/ChatWidget/ChatWindow";

export default function LojaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatButton />
      <ChatWindow />
    </div>
  );
}
