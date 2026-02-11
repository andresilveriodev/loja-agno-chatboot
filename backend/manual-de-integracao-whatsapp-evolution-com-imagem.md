## Integração WhatsApp + Evolution API com envio de imagem por URL

Este manual descreve a arquitetura e o fluxo para integrar o backend em NestJS com a Evolution API para envio de mensagens de texto e **imagens de produtos via URL direta**, sem download, buffer, `sharp` ou base64 no backend.

---

## Visão geral da arquitetura

- **Servidor de imagens (HTTP)**  
  - Hospeda todos os arquivos `.jpg` dos produtos.  
  - Exemplo (ambiente local): `http://localhost:3004`.

- **Backend NestJS (este projeto)**  
  - Resolve a **URL pública da imagem** de cada produto.  
  - Consome a **Evolution API** (`/message/sendText` e `/message/sendMedia`).  
  - Não faz download nem conversão de imagens.

- **Evolution API**  
  - Roda em outra porta/host (ex.: `http://localhost:8081`).  
  - Recebe o JSON do backend e baixa a imagem diretamente da URL informada.

Fluxo resumido:

1. Usuário envia mensagem no WhatsApp.  
2. Webhook (`/api/whatsapp/webhook`) recebe e processa.  
3. IA responde, incluindo ID(s) de produto (ex.: `prod_013`).  
4. Backend resolve a URL da imagem do produto.  
5. Backend chama `POST /message/sendMedia/{instance}` na Evolution API, passando a **URL da imagem**.  
6. Evolution baixa a imagem do servidor de arquivos e envia para o WhatsApp.

---

## Configuração de ambiente (.env)

No arquivo `backend/.env`, configurar:

```env
# Evolution API
EVOLUTION_API_URL=http://localhost:8081
EVOLUTION_INSTANCE_NAME=loja
EVOLUTION_INSTANCE_API_KEY=SEU_TOKEN_DA_INSTANCIA

# Servidor de imagens (todas as imagens em JPG)
PRODUCT_IMAGES_BASE_URL=http://localhost:3004
```

Regras importantes:

- `EVOLUTION_API_URL`: URL base da Evolution API (porta da API, não do servidor de imagens).  
- `EVOLUTION_INSTANCE_NAME`: nome exato da instância configurada na Evolution (ex.: `loja`).  
- `EVOLUTION_INSTANCE_API_KEY`: token da instância (hash), não o token global.  
- `PRODUCT_IMAGES_BASE_URL`: URL base de onde as imagens serão servidas (ex.: servidor estático ou Next).

---

## Organização e formato das imagens

### 1. Formato dos arquivos

- Todas as imagens usadas no fluxo de WhatsApp devem estar em **`.jpg`**.  
- Evitar WebP/AVIF para este fluxo, pois não há conversão no backend.

### 2. Local das imagens

Exemplos de caminhos esperados:

- `Midea Ar-Condicionado Split Inverter 9000 BTUs - AI Ecomaster.jpg`
- `Kit EPI Proteção Individual Pintor - Teknoluvas.jpg`

Com `PRODUCT_IMAGES_BASE_URL=http://localhost:3004`, a URL final de uma imagem ficaria:

```text
http://localhost:3004/Midea%20Ar-Condicionado%20Split%20Inverter%209000%20BTUs%20-%20AI%20Ecomaster.jpg
```

> Dica: use nomes de arquivo compatíveis com os nomes dos produtos (ou configure mapeamentos dedicados, abaixo).

---

## Resolução de URL de imagem no backend

### Serviço: `ProductsService.getProductImageUrl`

Responsabilidade: dado um `Product`, retornar **apenas a URL pública da imagem**, sem baixar/converter.

Regras implementadas:

1. Calcula um `folderName` a partir do nome do produto, com correções específicas (ex.: remoção de `/` → `110220V`, etc.).  
2. Monta uma lista de candidatos de nome de arquivo:
   - `folderName + ".jpg"`
   - `folderName + " 1.jpg"`
   - `folderName + "1.jpg"`
   - `folderName + " 2.jpg"`
   - `product.image` (quando preenchido).
3. **Primeiro** tenta resolver a URL via `product-image-urls.json` (mapeamento manual).  
4. Se não encontrar no mapeamento e `PRODUCT_IMAGES_BASE_URL` estiver configurado, monta a URL usando o primeiro candidato.

Em pseudocódigo:

```ts
getProductImageUrl(product: Product): string | null {
  const folderName = NAME_TO_FOLDER[product.name] ?? product.name;
  const fileCandidates = [
    `${folderName}.jpg`,
    `${folderName} 1.jpg`,
    `${folderName}1.jpg`,
    `${folderName} 2.jpg`,
    product.image?.trim(),
  ].filter(Boolean) as string[];

  // 1) Tenta mapeamento product-image-urls.json
  const mapping = getProductImageUrls();
  for (const key of fileCandidates) {
    const url = mapping[key];
    if (url) return url;
  }

  // 2) Fallback: monta URL com PRODUCT_IMAGES_BASE_URL
  if (!PRODUCT_IMAGES_BASE_URL) return null;
  if (fileCandidates.length === 0) return null;
  const base = PRODUCT_IMAGES_BASE_URL.replace(/\/$/, "");
  return `${base}/${encodeURIComponent(fileCandidates[0])}`;
}
```

Observações:

- Não há `fetch`, `Buffer` nem `sharp` aqui: apenas concatenação de strings.  
- Quaisquer correções específicas de nomes ficam centralizadas em `NAME_TO_FOLDER` e/ou `product-image-urls.json`.

---

## Endpoint opcional de imagem de produto

O endpoint abaixo é útil para:

- Testar se a URL está correta.  
- Documentar a URL pública da imagem de cada produto.

```ts
// GET /api/products/:id/image
@Get(':id/image')
async getProductImage(@Param('id') id: string, @Res() res: Response): Promise<void> {
  const product = await this.productsService.findById(id);
  if (!product) throw new NotFoundException('Produto não encontrado');

  const imageUrl = this.productsService.getProductImageUrl(product);
  if (!imageUrl) throw new NotFoundException('Imagem do produto não disponível');

  // Apenas redireciona para a URL pública (não faz proxy nem download)
  res.redirect(imageUrl);
}
```

---

## Serviço de envio para Evolution API (`WhatsAppService`)

### 1. Envio de texto

O envio de texto usa `POST /message/sendText/{instance}`:

```ts
async sendText(phone: string, text: string): Promise<SendTextResult> {
  const number = formatPhoneNumber(phone); // normaliza para 55DD9XXXXXXXX
  if (!number) return { sent: false, error: 'Número inválido' };

  const instanceEncoded = encodeURIComponent(EVOLUTION_INSTANCE || 'loja');
  const url = `${EVOLUTION_API_URL}/message/sendText/${instanceEncoded}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: this.headers,
    body: JSON.stringify({ number, text }),
  });

  // Tratamento de erro e retorno { sent, error? }
}
```

### 2. Envio de mídia usando URL direta

#### Requisitos funcionais

- **Não** baixar imagem no backend.  
- **Não** converter com `sharp`.  
- **Não** enviar base64.  
- Sempre enviar **URL direta** no campo `mediaMessage.media`.

#### Requisito da Evolution API

O schema da Evolution exige os campos `mediatype` e `media` no nível raiz do JSON para `/message/sendMedia/{instance}`.

#### Payload final usado

O backend envia para a Evolution:

```json
POST /message/sendMedia/{instance}
{
  "number": "5511999999999",
  "mediatype": "image",
  "media": "http://localhost:3004/Produto.jpg",
  "caption": "Nome do produto",
  "mediaMessage": {
    "mediatype": "image",
    "media": "http://localhost:3004/Produto.jpg",
    "caption": "Nome do produto"
  }
}
```

- **`mediaMessage`** segue o formato desejado (URL direta em `mediaMessage.media`).  
- **Campos raiz** (`mediatype`, `media`, `caption`) atendem à validação da Evolution.

#### Implementação no serviço

```ts
async sendMediaFromUrl(
  phone: string,
  mediaUrl: string,
  caption?: string,
): Promise<SendMediaResult> {
  const number = formatPhoneNumber(phone);
  if (!number) return { sent: false, error: 'Número inválido' };

  const instanceEncoded = encodeURIComponent(EVOLUTION_INSTANCE || 'loja');
  const sendUrl = `${EVOLUTION_API_URL}/message/sendMedia/${instanceEncoded}`;

  const safeCaption = caption?.trim() || undefined;

  const body = {
    number,
    mediatype: 'image' as const,
    media: mediaUrl,
    caption: safeCaption,
    mediaMessage: {
      mediatype: 'image' as const,
      media: mediaUrl,
      caption: safeCaption,
    },
  };

  const res = await fetch(sendUrl, {
    method: 'POST',
    headers: this.headers,
    body: JSON.stringify(body),
  });

  // Tratamento de erro e retorno { sent, error? }
}
```

> Importante: o backend **não faz nenhum `fetch` de imagem**. O único `fetch` aqui é para chamar a Evolution API (JSON).

---

## Uso da integração no webhook (`WhatsAppController`)

Fluxo simplificado no endpoint `POST /api/whatsapp/webhook`:

1. Validar se o evento é `messages.upsert`.  
2. Ignorar mensagens enviadas por nós (`fromMe = true`).  
3. Extrair:
   - `phone` (via `extractPhoneFromRemoteJid`).  
   - `text` (via `extractTextFromMessage`).  
4. Salvar mensagem do usuário (`ChatService`).  
5. Chamar IA (`AiService`) para gerar resposta.  
6. Persistir mensagem da IA (`ChatService`).  
7. Encontrar IDs de produto na resposta (`prod_XXX`) e/ou histórico.  
8. Para cada produto:
   - Buscar `Product` pelo ID.  
   - Resolver URL da imagem (`getProductImageUrl`).  
   - Chamar `sendMediaFromUrl(phone, imageUrl, product.name)`.  
9. Enviar resposta de texto com `sendText(phone, reply)`.

Ponto crítico da integração com imagem:

```ts
if (productIds.length > 0) {
  for (const productId of productIds) {
    const product = await this.productsService.findById(productId);
    if (!product) continue;

    const imageUrl = this.productsService.getProductImageUrl(product);
    if (!imageUrl) {
      console.warn('[WhatsApp] Imagem do produto não disponível:', productId);
      continue;
    }

    const mediaResult = await this.whatsappService.sendMediaFromUrl(
      phone,
      imageUrl,
      product.name,
    );

    // Logs de sucesso/erro conforme mediaResult.sent
  }
}
```

---

## Configuração na Evolution API

1. **Instância**
   - Criar/editar instância e anotar:
     - Nome (ex.: `loja`) → `EVOLUTION_INSTANCE_NAME`.  
     - Token da instância (hash) → `EVOLUTION_INSTANCE_API_KEY`.

2. **Webhook**
   - URL: `http://localhost:3001/api/whatsapp/webhook`.  
   - Evento: `messages.upsert`.

3. **Testes recomendados**
   - Enviar “Olá” no WhatsApp → verificar:
     - Webhook é chamado.  
     - IA responde.  
     - `sendText` funciona sem erros.
   - Pedir um produto específico (ex.: “quero o Midea Ar-Condicionado Split Inverter 9000 BTUs”) → verificar:
     - Log mostra o ID do produto (`prod_013`, por exemplo).  
     - Log mostra `mediaUrl` apontando para a porta `3004`.  
     - Evolution recebe `sendMedia` com `mediatype: "image"` e `media`/`mediaMessage.media` com a URL.  
     - A imagem chega corretamente no WhatsApp.

---

## Boas práticas e troubleshooting

- **Imagens 404**  
  - Verifique se a URL logada no backend abre no navegador.  
  - Corrija nomes de arquivo ou adicione entradas em `product-image-urls.json`.

- **Erro da Evolution “instance requires property 'mediatype'”**  
  - Confirme que o JSON raiz de `/message/sendMedia/{instance}` inclui:
    - `number`, `mediatype`, `media` (além de `mediaMessage`).

- **Timeout ou erro de rede no envio**  
  - Verificar se `EVOLUTION_API_URL` aponta realmente para a porta/host corretos da Evolution.  
  - Checar logs da Evolution para erros de download da imagem (URL inválida, CORS, etc.).

Com essa estrutura, o backend permanece simples e performático: ele apenas calcula URLs e conversa com a Evolution; toda a parte pesada de download e entrega da mídia fica com a Evolution/WhatsApp.

