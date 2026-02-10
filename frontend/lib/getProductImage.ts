import type { Product } from "@/lib/types";

const EXTENSIONS = [".webp", ".avif", ".jpg"] as const;

/**
 * Mapeamento nome do produto (JSON) → nome da pasta em public quando diferem.
 * Ex.: barras em "110/220V" ou "Parafusadeira/Chave" nas pastas ficam sem barra.
 */
const NAME_TO_FOLDER: Record<string, string> = {
  "Kit Sensor de Presença Bocal E27 - 110/220V":
    "Kit Sensor de Presença Bocal E27 - 110220V",
  "Medidor Digital de Energia Elétrica - Trifásico 220/380V":
    "Medidor Digital de Energia Elétrica - Trifásico 220380V",
  "Bosch Parafusadeira/Chave Impacto GDX 18V-285 - 285Nm":
    "Bosch ParafusadeiraChave Impacto GDX 18V-285 - 285Nm",
};

/**
 * Gera as URLs possíveis da imagem do produto com base na pasta em public.
 * A pasta tem o nome exato do produto; o arquivo principal tem o mesmo nome.
 * Aceita extensões .webp, .avif e .jpg (tentativa em ordem).
 */
export function getProductImageUrls(product: Product): string[] {
  const folderName = NAME_TO_FOLDER[product.name] ?? product.name;
  const folder = encodeURIComponent(folderName);
  const fileName = encodeURIComponent(folderName);
  return EXTENSIONS.map((ext) => `/${folder}/${fileName}${ext}`);
}
