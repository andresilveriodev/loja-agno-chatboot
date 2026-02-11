/**
 * Converte todas as imagens AVIF e WebP em frontend/public para JPG.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PUBLIC_DIR = path.join(__dirname, "..", "frontend", "public");
const CONVERT_EXT = [".avif", ".webp"];
const JPG_QUALITY = 85;

function unlinkWithRetry(filePath, retries = 3) {
  return new Promise((resolve, reject) => {
    const tryUnlink = (n) => {
      try {
        fs.unlinkSync(filePath);
        resolve();
      } catch (err) {
        if (n > 0 && (err.code === "EBUSY" || err.code === "EPERM")) {
          setTimeout(() => tryUnlink(n - 1), 800);
        } else {
          reject(err);
        }
      }
    };
    tryUnlink(retries);
  });
}

async function convertToJpg() {
  const files = fs.readdirSync(PUBLIC_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return CONVERT_EXT.includes(ext);
  });

  if (files.length === 0) {
    console.log("Nenhum arquivo AVIF ou WebP encontrado para converter.");
    return;
  }

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);
    const src = path.join(PUBLIC_DIR, file);
    const dest = path.join(PUBLIC_DIR, base + ".jpg");

    try {
      if (fs.existsSync(dest)) {
        await unlinkWithRetry(src);
        console.log(`Removido (JPG já existe): ${file}`);
        continue;
      }
      await sharp(src).jpeg({ quality: JPG_QUALITY }).toFile(dest);
      await unlinkWithRetry(src);
      console.log(`Convertido: ${file} → ${base}.jpg`);
    } catch (err) {
      console.error(`Erro em ${file}:`, err.message);
    }
  }

  console.log(`\nConcluído. ${files.length} arquivo(s) convertido(s) para JPG.`);
}

convertToJpg().catch(console.error);
