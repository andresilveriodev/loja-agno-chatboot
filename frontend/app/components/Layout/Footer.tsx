import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="mt-24 w-full border-t-2 border-[var(--lm-gray-200)] border-b-2 border-[var(--lm-green)] py-6 bg-[var(--lm-bg)]"
      role="contentinfo"
    >
      <div className="mx-auto max-w-lm-container px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8">
          <div className="rounded-lm-md bg-[var(--lm-surface)] p-6 shadow-lm-soft border border-black/5">
            <h4 className="m-0 text-base font-semibold text-[var(--lm-text)]">Loja Multidepartamental</h4>
            <p className="mt-2 text-sm text-[var(--lm-text-muted)] leading-normal">
              Equipamentos industriais e profissionais para o seu negócio. Qualidade e preço.
            </p>
          </div>
          <div className="rounded-lm-md bg-[var(--lm-surface)] p-6 shadow-lm-soft border border-black/5">
            <h4 className="m-0 text-base font-semibold text-[var(--lm-text)]">Institucional</h4>
            <ul className="mt-3 space-y-2 list-none pl-0">
              <li><Link href="#" className="text-sm text-[var(--lm-text-muted)] hover:text-[var(--lm-green-dark)] transition-colors">Sobre nós</Link></li>
              <li><Link href="#" className="text-sm text-[var(--lm-text-muted)] hover:text-[var(--lm-green-dark)] transition-colors">Contato</Link></li>
              <li><Link href="#" className="text-sm text-[var(--lm-text-muted)] hover:text-[var(--lm-green-dark)] transition-colors">Política de privacidade</Link></li>
            </ul>
          </div>
          <div className="rounded-lm-md bg-[var(--lm-surface)] p-6 shadow-lm-soft border border-black/5">
            <h4 className="m-0 text-base font-semibold text-[var(--lm-text)]">Atendimento</h4>
            <p className="mt-2 text-sm text-[var(--lm-text-muted)] leading-normal">
              Dúvidas? Fale com nosso assistente pelo chat no canto da tela.
            </p>
          </div>
        </div>
        <div className="mt-6 pt-6 text-center text-sm text-[var(--lm-text-muted)]">
          © {new Date().getFullYear()} Loja Multidepartamental. Catálogo de produtos.
        </div>
      </div>
    </footer>
  );
}
