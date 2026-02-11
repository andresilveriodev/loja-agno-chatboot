/**
 * Gera mapeamento de nomes de arquivo local → URL no servidor WordPress.
 * Padrão: https://andreadams.com.br/wp-content/uploads/2026/02/Nome-Formatado.jpg
 */
const fs = require("fs");
const path = require("path");

const PUBLIC_DIR = path.join(__dirname, "..", "frontend", "public");
const BASE_URL = "https://andreadams.com.br/wp-content/uploads/2026/02";

const ACCENTS = {
  á: "a", à: "a", ã: "a", â: "a", ä: "a", Á: "a", À: "a", Ã: "a", Â: "a",
  é: "e", è: "e", ê: "e", ë: "e",   É: "e", È: "e", Ê: "e",
  í: "i", ì: "i", î: "i", ï: "i", Í: "i", Ì: "i", Î: "i",
  ó: "o", ò: "o", õ: "o", ô: "o", ö: "o", Ó: "o", Ò: "o", Õ: "o", Ô: "o",
  ú: "u", ù: "u", û: "u", ü: "u", Ú: "u", Ù: "u", Û: "u",
  ç: "c", Ç: "c", ñ: "n", Ñ: "n",
  "°": "",
};

function toWordPressSlug(filename) {
  const ext = path.extname(filename).toLowerCase();
  let base = path.basename(filename, ext);
  // "Nome 1" ou "Nome 2" → "Nome-1" ou "Nome-2"
  base = base.replace(/\s+(\d+)$/, "-$1");
  // Espaços → hífens
  let slug = base.replace(/\s+/g, "-");
  // Remove acentos
  slug = slug.split("").map((c) => ACCENTS[c] || c).join("");
  // Remove apóstrofo (ex: d'Água)
  slug = slug.replace(/'/g, "");
  // Colapsa hífens duplicados
  slug = slug.replace(/-+/g, "-").replace(/^-|-$/g, "");
  return slug + ext;
}

function main() {
  const files = fs.readdirSync(PUBLIC_DIR).filter((f) =>
    /\.(jpg|jpeg|webp|avif)$/i.test(f)
  );

  const mapping = {};
  const urls = [];

  for (const file of files) {
    const slug = toWordPressSlug(file);
    const url = `${BASE_URL}/${slug}`;
    mapping[file] = url;
    urls.push({ file, url });
  }

  const outputDir = path.join(__dirname, "..", "backend", "src", "modules", "products");
  const outputPath = path.join(outputDir, "product-image-urls.json");
  const urlsListPath = path.join(outputDir, "product-image-urls-list.txt");

  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2), "utf8");
  fs.writeFileSync(urlsListPath, Object.values(mapping).join("\n"), "utf8");
  console.log(`Gerado ${outputPath} e ${urlsListPath} com ${Object.keys(mapping).length} entradas.\n`);

  urls.forEach(({ file, url }) => console.log(`${file}\n  → ${url}`));
}

main();
