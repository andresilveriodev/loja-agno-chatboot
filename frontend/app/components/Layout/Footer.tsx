import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-primary-200 bg-primary-900 text-primary-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Loja Multidepartamental</h3>
            <p className="mt-2 text-sm text-primary-200">
              Equipamentos industriais e profissionais para o seu negócio. Qualidade e preço.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Institucional</h4>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-primary-200 hover:text-white">Sobre nós</Link></li>
              <li><Link href="#" className="text-sm text-primary-200 hover:text-white">Contato</Link></li>
              <li><Link href="#" className="text-sm text-primary-200 hover:text-white">Política de privacidade</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Ajuda</h4>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-primary-200 hover:text-white">FAQ</Link></li>
              <li><Link href="#" className="text-sm text-primary-200 hover:text-white">Formas de pagamento</Link></li>
              <li><Link href="#" className="text-sm text-primary-200 hover:text-white">Entrega</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Atendimento</h4>
            <p className="mt-4 text-sm text-primary-200">
              Dúvidas? Fale com nosso assistente pelo chat no canto da tela.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-800 pt-8 text-center text-sm text-primary-300">
          © {new Date().getFullYear()} Loja Multidepartamental. Catálogo de produtos. Não é e-commerce.
        </div>
      </div>
    </footer>
  );
}
