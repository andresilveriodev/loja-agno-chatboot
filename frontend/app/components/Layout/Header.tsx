"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Início" },
  { href: "/#catalogo", label: "Catálogo" },
  { href: "/#catalogo", label: "Ofertas" },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-20 bg-[linear-gradient(90deg,var(--lm-green),var(--lm-green-dark))] shadow-[0_2px_10px_rgba(0,0,0,0.16)]"
      role="banner"
    >
      <nav className="mx-auto max-w-lm-main px-4 py-0 sm:px-6" aria-label="Navegação principal">
        <ul className="flex flex-wrap items-center gap-4 overflow-x-auto py-0 list-none">
          <li className="shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-[#f8fdf8] no-underline border border-transparent transition-[background-color,border-color,color,transform] duration-150 ease-out hover:bg-white/10 hover:border-white/35 hover:-translate-y-px"
              aria-label="Ir para página inicial"
            >
              <Image
                src="https://andreadams.com.br/wp-content/uploads/2026/02/logo-multidepartamental.png"
                alt="Loja Multidepartamental"
                width={180}
                height={35}
                priority
              />
            </Link>
          </li>
          {NAV_ITEMS.map(({ href, label }) => (
            <li key={label} className="shrink-0">
              <Link
                href={href}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-[#f8fdf8] no-underline border border-transparent transition-[background-color,border-color,color,transform] duration-150 ease-out hover:bg-white/10 hover:border-white/35 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-green)]"
                aria-label={label}
              >
                {label}
              </Link>
            </li>
          ))}
          <li className="ml-auto shrink-0 flex items-center gap-2">
            <span className="sr-only">Busca e conta</span>
            <span className="hidden sm:flex items-center rounded-full border border-white/20 bg-white/10 pl-[25px] pr-3 py-1.5 text-sm text-white/90 max-w-[200px]">
              <Search className="h-4 w-4 shrink-0 text-white/80" aria-hidden />
              <span className="truncate text-white/90">Buscar...</span>
            </span>
            <Link
              href="/crm"
              className="inline-flex items-center justify-center rounded-full p-2 text-[#f8fdf8] transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="CRM - Funil de vendas"
            >
              <span className="hidden sm:inline text-sm font-medium px-2">CRM</span>
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-2 text-[#f8fdf8] transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Minha conta"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium ml-1">Conta</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="border-t border-white/10 px-4 py-2 bg-white">
        <p className="mx-auto max-w-lm-main text-center text-xs sm:text-sm text-[var(--lm-green-dark)]">
          Ferramentas • Energia • Jardinagem • Climatização • Cozinha Industrial • EPIs • Materiais • Armazenagem • Automação
        </p>
      </div>
    </header>
  );
}
