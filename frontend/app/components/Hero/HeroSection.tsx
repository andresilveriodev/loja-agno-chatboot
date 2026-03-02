export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden rounded-lm-lg bg-[radial-gradient(circle_at_top_left,#fff_0,#f1fff0_40%,#e8ffe3_80%)] p-6 sm:p-8 shadow-lm-strong mb-16"
      style={{ paddingTop: '33px', marginTop: '86px' }}
      aria-labelledby="hero-title"
    >
      <div className="relative z-0 max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--lm-green)]/25 bg-white/90 px-3.5 py-1.5 text-[13px] font-medium uppercase tracking-wider text-[var(--lm-green-dark)]">
          Loja multidepartamental
        </span>
        <h1 id="hero-title" className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[var(--lm-text)] sm:text-4xl md:text-5xl">
          Equipamentos industriais e profissionais
        </h1>
        <p className="mt-4 max-w-[640px] text-[15px] leading-relaxed text-[var(--lm-text-muted)]">
          Ferramentas, energia, climatização, cozinha industrial, EPIs e mais. Tudo
          para o seu negócio em um só lugar.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="#catalogo"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lm-green)] px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_30px_rgba(21,129,16,0.35)] transition-[background-color,transform,box-shadow] duration-[220ms] ease-out hover:bg-[var(--lm-green-dark)] hover:-translate-y-px hover:shadow-[0_14px_36px_rgba(21,129,16,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-green)]"
          >
            Explorar catálogo
          </a>
          <a
            href="#catalogo"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/8 bg-white/95 px-5 py-2.5 text-sm font-medium text-[var(--lm-green-dark)] transition-[background-color,border-color,transform] duration-[220ms] ease-out hover:bg-white hover:border-black/14 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-green)]"
          >
            Ver ofertas
          </a>
        </div>
      </div>
    </section>
  );
}
