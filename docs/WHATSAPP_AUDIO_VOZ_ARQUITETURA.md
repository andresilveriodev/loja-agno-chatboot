## Suporte a Áudio no WhatsApp (Evolution API + OpenAI Whisper)

### 1. Objetivo

Permitir que a IA reconheça e responda **mensagens de voz do WhatsApp**, seguindo este fluxo:

- Usuário envia áudio/PTT no WhatsApp.
- Evolution API envia **webhook** (`messages.upsert`) para o backend (NestJS).
- Backend:
  - Detecta que é mensagem de **áudio**.
  - Baixa o arquivo de áudio pela **URL** da Evolution.
  - Transcreve o áudio com **OpenAI Whisper**.
  - Envia o texto transcrito para o serviço de IA de **chat** já existente.
  - Salva histórico no **CRM/Chat**.
  - Responde via Evolution API para o usuário.

---

### 2. Visão Geral da Arquitetura

- **Evolution API**
  - Conecta com o WhatsApp.
  - Envia webhooks `messages.upsert`.
  - Entrega `audioMessage` / `pttMessage` com **URL** do áudio.

- **Backend (NestJS)**
  - `WhatsAppController` (`/api/whatsapp/webhook`):
    - Recebe o webhook.
    - Detecta se a mensagem é **texto** ou **áudio**.
    - Orquestra chamadas para CRM, IA e áudio.
  - `WhatsAppService`:
    - Cliente da Evolution API para **envio** de mensagens (texto e mídia).
  - `AudioModule` / `AudioService` (**novo**):
    - Baixa o áudio a partir da URL da Evolution.
    - Chama o serviço de IA para **transcrever** (Whisper).
  - `AiModule` / `AiService`:
    - Já existente para **chat** (`AI_SERVICE_URL`).
    - Será estendido com método de **transcrição de áudio** usando OpenAI Whisper.
  - `ChatModule` / `ChatService`:
    - Salva mensagens na tabela `messages`.
  - `CrmModule` / `CrmService`:
    - `findOrCreateLeadByPhone`, atualização de lead, timeline, etc.
  - Entidade `Message`:
    - Campos `content`, `type`, `source`, `sessionId`, `leadId`.

- **OpenAI Whisper**
  - API de transcrição de áudio:
    - `model = "whisper-1"`.
    - Entrada: arquivo (ogg/opus) vindo da Evolution.
    - Saída: texto transcrito em português.

---

### 3. Fluxo Completo da Mensagem de Voz

1. **Usuário** envia áudio/ptt pelo WhatsApp.
2. **Evolution API** dispara webhook `messages.upsert` com:
   - `data.key.remoteJid` (ex.: `5511999999999@s.whatsapp.net`).
   - `data.message.audioMessage` ou `data.message.pttMessage`:
     - `url`: URL pública do áudio.
     - `mimetype`: ex. `audio/ogg; codecs=opus`.
     - `seconds`: duração.
3. **WhatsAppController**:
   - Valida que `event === "messages.upsert"` e `data` existe.
   - Ignora mensagens com `fromMe === true`.
   - Extrai `phone` de `remoteJid`.
   - Tenta extrair texto com `extractTextFromMessage(message)`.
   - Se **não houver texto**:
     - Verifica se é **mensagem de áudio**:
       - `isAudioMessage(payload.data)`.
       - `audioUrl = extractAudioUrlFromMessage(payload.data.message)`.
     - Chama `audioService.processWhatsAppAudio({ audioUrl, remoteJid })`.
     - Recebe:
       - Sucesso: `text` transcrito.
       - Erro: mensagem amigável para o usuário (fallback).
   - A partir do momento em que há `text` (digitado ou transcrito), segue o fluxo normal de texto.
4. **CrmService + ChatService**:
   - `findOrCreateLeadByPhone(phone)`.
   - Atualiza nome do lead (se conseguir extrair do texto).
   - `ChatService.saveMessage` salva mensagem do usuário:
     - `sessionId = "wa:" + phone`.
     - `sender = "user"`.
     - `content = text` (texto digitado ou transcrito).
     - `type = "audio"` quando a origem foi áudio.
     - `source = "whatsapp"`.
     - `leadId` associado.
5. **AiService.chat**:
   - Envia o `text` para o serviço de IA (`AI_SERVICE_URL`).
   - Recebe `reply` (texto).
6. **Resposta ao usuário**:
   - `ChatService.saveMessage` salva resposta do bot.
   - Lógica de produtos/fotos (já existente) analisa `reply`:
     - Extrai IDs `prod_XXX`.
     - Envia imagens se necessário (`WhatsAppService.sendMediaFromUrl`).
   - `WhatsAppService.sendText(phone, reply)` responde via Evolution.
7. **Erros na transcrição/áudio**:
   - Se `AudioService` não conseguir baixar ou transcrever:
     - Envia mensagem fixa ao usuário (ex.: “Não consegui entender seu áudio, pode repetir em texto?”).
     - Não chama IA de chat.

---

### 4. Estrutura de Arquivos Envolvidos

#### 4.1. Já existentes (relevantes)

- `backend/src/modules/whatsapp/whatsapp.controller.ts`
- `backend/src/modules/whatsapp/whatsapp.service.ts`
- `backend/src/modules/whatsapp/dto/evolution-webhook.dto.ts`
- `backend/src/modules/ai/ai.service.ts`
- `backend/src/modules/ai/ai.module.ts`
- `backend/src/modules/chat/chat.service.ts`
- `backend/src/modules/crm/crm.service.ts`
- `backend/src/entities/message.entity.ts`
- `backend/src/modules/whatsapp/whatsapp.module.ts`

#### 4.2. Novos arquivos

- `backend/src/modules/audio/audio.module.ts`
- `backend/src/modules/audio/audio.service.ts`

---

### 5. Alterações Planejadas (por arquivo)

#### 5.1. DTO do Webhook da Evolution

**Arquivo:** `backend/src/modules/whatsapp/dto/evolution-webhook.dto.ts`

- Estender `EvolutionWebhookPayload.data.message` com:
  - `audioMessage?: { url?: string; mimetype?: string; seconds?: number }`
  - `pttMessage?: { url?: string; mimetype?: string; seconds?: number }`
- Adicionar funções auxiliares:
  - `isAudioMessage(data): boolean`
    - Verifica se existe `audioMessage.url` ou `pttMessage.url`.
  - `extractAudioUrlFromMessage(message): string | null`
    - Retorna a `url` de áudio (priorizando `audioMessage`, depois `pttMessage`).
- Manter `extractTextFromMessage(message)` para mensagens de texto.

#### 5.2. AudioModule e AudioService (novo)

**Arquivo:** `backend/src/modules/audio/audio.module.ts`

- Importa `AiModule`.
- Providers: `AudioService`.
- Exports: `AudioService`.

**Arquivo:** `backend/src/modules/audio/audio.service.ts`

Responsabilidades:

- Receber:
  - `audioUrl` (da Evolution).
  - `remoteJid` (para log).
- Fazer download:
  - `fetch(audioUrl)` com GET.
  - Converter para `Buffer`.
- Chamar o serviço de IA:
  - `AiService.transcribeAudio({ audio: buffer, filename: "audio.ogg", language: "pt" })`.
- Tratar erros:
  - HTTP não OK, rede, buffer vazio, erro da IA.
- Retornar tipo:

```ts
type ProcessWhatsAppAudioResult =
  | { success: true; text: string; durationSeconds?: number }
  | { success: false; error: string; details?: string };
```

#### 5.3. AiService – método de transcrição

**Arquivo:** `backend/src/modules/ai/ai.service.ts`

- Já possui `chat(input: AiChatInput): Promise<AiChatOutput | null>`.
- Será adicionado:

  - Tipos:

    ```ts
    interface TranscribeAudioInput {
      audio: Buffer | Uint8Array;
      filename?: string;
      language?: string;
    }

    interface TranscribeAudioResult {
      success: true;
      text: string;
    } | {
      success: false;
      error: string;
    }
    ```

  - Método:

    ```ts
    async transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioResult>;
    ```

- Implementação prevista (OpenAI Whisper):
  - Usar SDK da OpenAI (lib `openai`) com `OPENAI_API_KEY`.
  - Chamar `openai.audio.transcriptions.create({ model: "whisper-1", file, language: "pt" })`.
  - Mapear erros (chave ausente, limite, formato inválido) para mensagem amigável.

#### 5.4. WhatsAppModule – import do AudioModule

**Arquivo:** `backend/src/modules/whatsapp/whatsapp.module.ts`

- Adicionar `AudioModule` em `imports`:
  - Permite injetar `AudioService` no `WhatsAppController`.

#### 5.5. WhatsAppController – fluxo de áudio

**Arquivo:** `backend/src/modules/whatsapp/whatsapp.controller.ts`

- Injetar `AudioService` no construtor.
- No método `webhook`:
  1. Validar evento / data e ignorar `fromMe`.
  2. Extrair `phone` de `remoteJid`.
  3. Definir:
     - `sessionId = "wa:" + phone`.
     - `metadata = { source: "whatsapp", phone }`.
  4. Obter `text` via `extractTextFromMessage(payload.data.message)`.
  5. Se **não houver texto** e **for áudio**:
     - `audioUrl = extractAudioUrlFromMessage(payload.data.message)`.
     - `audioResult = await audioService.processWhatsAppAudio({ audioUrl, remoteJid })`.
     - Se `!audioResult.success`:
       - Enviar mensagem amigável com `whatsappService.sendText(phone, audioResult.error)`.
       - `return { ok: true }`.
     - Caso sucesso:
       - `text = audioResult.text`.
  6. Se **ainda assim não houver `text`**:
     - Ignorar (não é texto nem áudio suportado).
  7. Com `text` definido:
     - `lead = crmService.findOrCreateLeadByPhone(phone)`.
     - Atualizar nome do lead (se apropriado).
     - `chatService.saveMessage` para usuário:
       - `content = text`.
       - `type = isAudioMessage(payload.data) ? "audio" : "text"`.
       - `source = "whatsapp"`.
       - `metadata`, `leadId`.
     - `aiService.chat({ message: text, sessionId, userId: sessionId })`.
     - Salvar resposta do bot e seguir fluxo já existente de produtos/fotos.
     - `whatsappService.sendText(phone, reply)`.

---

### 6. Variáveis de Ambiente Necessárias

- **Existentes (Evolution / IA de chat):**
  - `EVOLUTION_API_URL` – URL base da Evolution API.
  - `EVOLUTION_INSTANCE_NAME` – nome da instância no Evolution.
  - `EVOLUTION_INSTANCE_API_KEY` / `EVOLUTION_API_KEY` – chave da instância.
  - `AI_SERVICE_URL` – URL do serviço de chat da IA já existente.

- **Nova (para áudio/Whisper):**
  - `OPENAI_API_KEY` – chave da OpenAI para o modelo Whisper.

Comportamento recomendado:

- Se `OPENAI_API_KEY` não estiver configurada:
  - `AiService.transcribeAudio` devolve `success: false` com mensagem genérica:
    - “Serviço de transcrição não está configurado no momento.”
  - `AudioService` retorna fallback para o usuário.

---

### 7. Tratamento de Erros e Segurança

- **Download do áudio falhou (rede/HTTP):**
  - Mensagem ao usuário:
    - “Não consegui baixar seu áudio, pode repetir em texto?”
  - Logar internamente detalhes (status, body, erro de rede).

- **Transcrição falhou (Whisper / OpenAI):**
  - Mensagem ao usuário:
    - “Não consegui entender seu áudio, pode repetir em texto?”
  - Não chamar IA de chat para evitar respostas vazias.

- **Webhook sempre retorna `{ ok: true }`:**
  - Mesmo em falha de transcrição, para evitar reenvio em loop pela Evolution.

- **Logs:**
  - Evitar logar a transcrição completa em produção.
  - Logar apenas alguns caracteres iniciais e tamanho.
  - Logar tipo de erro (rede, HTTP, OpenAI, etc.).

- **Segurança:**
  - `OPENAI_API_KEY` apenas em variáveis de ambiente (não commitar).
  - Validar origem do webhook quando a Evolution permitir (token/assinatura).

---

### 8. Checklist de Implementação para o Dev

1. **Ambiente**
   - Definir `OPENAI_API_KEY` no `.env` do backend.
   - Garantir `EVOLUTION_API_URL`, `EVOLUTION_INSTANCE_NAME`, `EVOLUTION_INSTANCE_API_KEY` e `AI_SERVICE_URL`.
   - Instalar a lib da OpenAI:
     - `npm install openai` (no backend).

2. **DTO do Webhook**
   - Estender `EvolutionWebhookPayload` com `audioMessage` e `pttMessage`.
   - Criar `isAudioMessage(data)` e `extractAudioUrlFromMessage(message)`.

3. **AudioModule / AudioService**
   - Criar `audio.module.ts` importando `AiModule`.
   - Criar `audio.service.ts` com:
     - `processWhatsAppAudio({ audioUrl, remoteJid })`.
     - Download do áudio (`fetch`).
     - Chamada a `AiService.transcribeAudio`.
     - Tratamento de erros e retorno padronizado.

4. **AiService**
   - Adicionar tipos `TranscribeAudioInput` e `TranscribeAudioResult`.
   - Implementar `transcribeAudio` usando OpenAI Whisper (`whisper-1`).

5. **WhatsAppModule**
   - Importar `AudioModule` em `imports`.

6. **WhatsAppController**
   - Injetar `AudioService` no construtor.
   - No `webhook`:
     - Quando não houver texto, mas `isAudioMessage(data)` for `true`, chamar `AudioService`.
     - Usar o texto transcrito como `message` para todo o fluxo já existente (lead, IA, CRM, resposta).
     - Salvar mensagens do usuário com `type = "audio"` quando origem for áudio.

7. **Testes manuais**
   - Subir backend (`npm run start:dev`).
   - Configurar webhook da Evolution para `/api/whatsapp/webhook`.
   - Testar:
     - Mensagem de **texto** (garantir que nada quebrou).
     - Mensagem de **áudio** clara e curta.
     - Simular falhas (remover `OPENAI_API_KEY` ou derrubar internet) para ver mensagem de fallback ao usuário.

---

### 9. Observações de Manutenibilidade

- O fluxo de áudio foi acoplado de forma **mínima** ao fluxo já existente:
  - Novos módulos/serviços (`AudioModule`, `AudioService`).
  - Pequenas extensões em `AiService` e no DTO do webhook.
  - `WhatsAppController` apenas ganhou um **ramo inicial** para áudio.
- Isso facilita:
  - Trocar o motor de transcrição (ex.: outro provedor ou serviço interno) apenas dentro de `AiService` / `AudioService`.
  - Evoluir regras de negócio de CRM sem mexer em detalhes de áudio.

