"use client";

import Link from "next/link";
import { Search, User, ShoppingCart } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-primary-200 bg-primary-50/95 backdrop-blur supports-[backdrop-filter]:bg-primary-50/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-primary-800 transition hover:text-primary-600"
          aria-label="Ir para página inicial"
        >
          <span className="text-xl">🛠️</span>
          <span className="hidden sm:inline">Loja Multidepartamental</span>
        </Link>

        <div className="flex flex-1 items-center justify-center max-w-md">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-600"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Buscar produtos..."
              className="h-10 w-full rounded-lg border border-primary-200 bg-white pl-10 pr-4 text-sm text-primary-900 placeholder:text-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              aria-label="Buscar produtos"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg p-2 text-primary-700 transition hover:bg-primary-100"
            aria-label="Minha conta"
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:inline text-sm font-medium">Conta</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg p-2 text-primary-700 transition hover:bg-primary-100"
            aria-label="Carrinho"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline text-sm font-medium">Catálogo</span>
          </button>
        </div>
      </div>

      <nav className="border-t border-primary-200 bg-primary-100/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="py-2 text-center text-sm font-medium text-primary-700">
            Ferramentas • Energia • Jardinagem • Climatização • Cozinha Industrial • EPIs • Materiais • Armazenagem • Automação
          </p>
        </div>
      </nav>
    </header>
  );
}
