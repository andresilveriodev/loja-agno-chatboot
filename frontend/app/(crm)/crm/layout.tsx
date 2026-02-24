import Link from "next/link";
import "./crm-design-system.css";

export const metadata = {
  title: "CRM · Funil de Vendas | Loja Multidepartamental",
  description: "Painel CRM Kanban — leads e pedidos.",
};

export default function CrmLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="crm-root flex min-h-screen flex-col">
      <header className="crm-navbar" role="banner">
        <Link href="/crm" className="crm-navbar-brand" aria-label="CRM Funil">
          CRM · Funil de Vendas
        </Link>
        <nav className="crm-navbar-links" aria-label="Menu do CRM">
          <Link href="/crm">Funil</Link>
          <Link href="/">Ir para loja</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
