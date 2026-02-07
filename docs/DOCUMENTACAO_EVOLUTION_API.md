# 📚 Documentação Evolution API - Instalação e Configuração

## 🔗 Links Oficiais

- **Documentação Oficial**: https://doc.evolution-api.com
- **Documentação V2**: https://doc.evolution-api.com/v2/en
- **Documentação V1**: https://doc.evolution-api.com/v1/en
- **GitHub Repository**: https://github.com/EvolutionAPI/evolution-api
- **Docker Hub**: https://hub.docker.com/r/evoapicloud/evolution-api

---

## 📦 Métodos de Instalação

### 1. Docker (Recomendado)

A instalação via Docker é o método mais recomendado para a maioria dos usuários.

**Documentação oficial**: https://doc.evolution-api.com/v2/en/install/docker

#### Pré-requisitos:
- Docker instalado
- Docker Compose instalado
- PostgreSQL configurado
- Redis configurado

#### Instalação Rápida (Teste):
```bash
docker run -d --name evolution_api -p 8080:8080 -e AUTHENTICATION_API_KEY=change-me atendai/evolution-api:latest
```

#### Instalação com Docker Compose:

1. **Clone o repositório oficial**:
```bash
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api
```

2. **Use o docker-compose.yaml oficial** do repositório ou crie o seu próprio

3. **Configure as variáveis de ambiente** (veja seção abaixo)

4. **Inicie os serviços**:
```bash
docker compose up -d
```

#### Exemplo de docker-compose.yml básico:
```yaml
services:
  api:
    container_name: evolution_api
    image: evoapicloud/evolution-api:latest
    restart: always
    depends_on:
      - redis
      - postgres
    ports:
      - "8080:8080"
    volumes:
      - evolution_instances:/evolution/instances
    networks:
      - evolution-net
    environment:
      - AUTHENTICATION_API_KEY=your-secret-key-here
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://user:password@postgres:5432/evolution
      - CACHE_REDIS_ENABLED=true
      - CACHE_REDIS_URI=redis://redis:6379/6

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - evolution-net

  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: evolution
      POSTGRES_USER: evolution
      POSTGRES_PASSWORD: evolution123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - evolution-net

volumes:
  evolution_instances:
  redis_data:
  postgres_data:

networks:
  evolution-net:
    driver: bridge
```

### 2. NVM (Node Version Manager)

**Documentação oficial**: https://doc.evolution-api.com/v2/en/install/nvm

#### Pré-requisitos:
- Node.js v20.10.0 ou superior
- PostgreSQL configurado
- Redis configurado

#### Passos:
1. Clone o repositório
2. Instale Node.js v20.10.0 usando NVM
3. Execute `npm install`
4. Configure o arquivo `.env`
5. Execute `npm start`

---

## ⚙️ Configuração - Variáveis de Ambiente

**Documentação completa**: https://doc.evolution-api.com/v2/en/env

### 📋 Arquivo .env

O arquivo `.env.example` está disponível no repositório oficial:
https://github.com/EvolutionAPI/evolution-api/blob/main/Docker/.env.example

Copie o arquivo de exemplo e personalize:
```bash
cp .env.example .env
```

### 🔑 Variáveis Principais

#### **Configurações do Servidor**
```env
SERVER_TYPE=http                    # http ou https
SERVER_PORT=8080                    # Porta do servidor
SERVER_URL=http://localhost:8080   # URL do servidor para webhooks
SERVER_NAME=evolution              # Nome do servidor
```

#### **Autenticação**
```env
AUTHENTICATION_API_KEY=your-secret-key-here  # OBRIGATÓRIO - Chave de autenticação
AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
```

#### **Banco de Dados**
```env
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql       # postgresql ou mysql
DATABASE_CONNECTION_URI=postgresql://user:password@host:5432/database
DATABASE_CONNECTION_CLIENT_NAME=evolution
```

#### **Redis (Cache)**
```env
CACHE_REDIS_ENABLED=true
CACHE_REDIS_URI=redis://host:6379/6
CACHE_REDIS_TTL=604800
CACHE_REDIS_PREFIX_KEY=evolution
CACHE_REDIS_SAVE_INSTANCES=false
```

#### **CORS**
```env
CORS_ORIGIN=*                      # Origens permitidas (* para todas)
CORS_METHODS=GET,POST,PUT,DELETE   # Métodos HTTP permitidos
CORS_CREDENTIALS=true              # Permitir cookies
```

#### **Logs**
```env
LOG_LEVEL=INFO                     # ERROR, WARN, DEBUG, INFO, LOG, VERBOSE, DARK, WEBHOOKS
LOG_COLOR=true                     # Logs coloridos
LOG_BAILEYS=error                  # Nível de log do Baileys
```

#### **Webhooks Globais**
```env
WEBHOOK_GLOBAL_ENABLED=false
WEBHOOK_GLOBAL_URL=http://your-service/webhook
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false
```

#### **Eventos de Webhook**
```env
WEBHOOK_EVENTS_QRCODE_UPDATED=true
WEBHOOK_EVENTS_MESSAGES_SET=true
WEBHOOK_EVENTS_MESSAGES_UPSERT=true
WEBHOOK_EVENTS_MESSAGES_EDITED=true
WEBHOOK_EVENTS_MESSAGES_UPDATE=true
WEBHOOK_EVENTS_MESSAGES_DELETE=true
WEBHOOK_EVENTS_SEND_MESSAGE=true
WEBHOOK_EVENTS_CONNECTION_UPDATE=true
WEBHOOK_EVENTS_CONTACTS_SET=true
WEBHOOK_EVENTS_CONTACTS_UPSERT=true
WEBHOOK_EVENTS_CONTACTS_UPDATE=true
WEBHOOK_EVENTS_CHATS_SET=true
WEBHOOK_EVENTS_CHATS_UPSERT=true
WEBHOOK_EVENTS_CHATS_UPDATE=true
WEBHOOK_EVENTS_CHATS_DELETE=true
WEBHOOK_EVENTS_GROUPS_UPSERT=true
WEBHOOK_EVENTS_GROUPS_UPDATE=true
WEBHOOK_EVENTS_GROUP_PARTICIPANTS_UPDATE=true
```

#### **Configurações de Sessão**
```env
CONFIG_SESSION_PHONE_CLIENT=Evolution API
CONFIG_SESSION_PHONE_NAME=Chrome
QRCODE_LIMIT=30
QRCODE_COLOR='#175197'
```

#### **Salvamento de Dados**
```env
DATABASE_SAVE_DATA_INSTANCE=true
DATABASE_SAVE_DATA_NEW_MESSAGE=true
DATABASE_SAVE_MESSAGE_UPDATE=true
DATABASE_SAVE_DATA_CONTACTS=true
DATABASE_SAVE_DATA_CHATS=true
DATABASE_SAVE_DATA_LABELS=true
DATABASE_SAVE_DATA_HISTORIC=true
DATABASE_SAVE_IS_ON_WHATSAPP=true
DATABASE_SAVE_IS_ON_WHATSAPP_DAYS=7
DATABASE_DELETE_MESSAGE=true
```

#### **Integrações (Opcionais)**

**RabbitMQ:**
```env
RABBITMQ_ENABLED=false
RABBITMQ_URI=amqp://user:password@host:5672
```

**WebSocket:**
```env
WEBSOCKET_ENABLED=false
WEBSOCKET_GLOBAL_ENABLED=false
```

**WhatsApp Business API:**
```env
WA_BUSINESS_TOKEN_WEBHOOK=your-token
WA_BUSINESS_URL=https://graph.facebook.com
WA_BUSINESS_VERSION=v20.0
WA_BUSINESS_LANGUAGE=en_US
```

**OpenAI:**
```env
OPENAI_ENABLED=false
OPENAI_API_KEY=sk-proj-your-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=500
```

**Typebot:**
```env
TYPEBOT_ENABLED=false
TYPEBOT_URL=http://typebot:3000
```

**Chatwoot:**
```env
CHATWOOT_ENABLED=false
CHATWOOT_URL=http://chatwoot:3000
```

**Dify:**
```env
DIFY_ENABLED=false
DIFY_URL=http://dify:3000
```

**Amazon S3 / MinIO:**
```env
S3_ENABLED=false
S3_BUCKET=your-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_ENDPOINT=https://s3.amazonaws.com
```

#### **Telemetria**
```env
TELEMETRY_ENABLED=true
```

#### **Recursos Desabilitados (Padrão)**
```env
RABBITMQ_ENABLED=false
SQS_ENABLED=false
WEBSOCKET_ENABLED=false
PUSHER_ENABLED=false
KAFKA_ENABLED=false
TYPEBOT_ENABLED=false
CHATWOOT_ENABLED=false
OPENAI_ENABLED=false
DIFY_ENABLED=false
N8N_ENABLED=false
EVOAI_ENABLED=false
S3_ENABLED=false
CACHE_LOCAL_ENABLED=false
```

---

## 🚀 Inicialização e Verificação

### 1. Iniciar os serviços:
```bash
docker compose up -d
```

### 2. Verificar se está rodando:
```bash
curl http://localhost:8080/health
```

### 3. Verificar logs:
```bash
docker logs evolution_api -f
```

### 4. Acessar o Manager (Interface Web):
- URL: http://localhost:8080/manager
- Ou use o Evolution Manager separado: https://github.com/EvolutionAPI/evolution-manager-v2

---

## 🔐 Segurança

### Chave de Autenticação

**IMPORTANTE**: Sempre defina uma `AUTHENTICATION_API_KEY` forte e única.

```env
AUTHENTICATION_API_KEY=your-very-secure-random-key-here
```

### Uso da API

Todas as requisições devem incluir o header de autenticação:
```bash
Authorization: Bearer your-authentication-api-key
```

Exemplo:
```bash
curl -X GET "http://localhost:8080/instance/fetchInstances" \
  -H "Authorization: Bearer your-authentication-api-key"
```

---

## 📱 Tipos de Conexão

### WhatsApp API - Baileys (Gratuito)
- Baseado no WhatsApp Web
- Usa a biblioteca Baileys
- Gratuito, mas com limitações
- Adequado para bots e automações

### WhatsApp Cloud API (Oficial Meta)
- API oficial do Meta/Facebook
- Requer conformidade com políticas do Meta
- Pode ter custos baseados em volume
- Mais robusto e confiável para negócios

---

## 🔗 Integrações Disponíveis

- **Typebot**: Bots conversacionais
- **Chatwoot**: Atendimento ao cliente
- **RabbitMQ**: Eventos via message broker
- **Apache Kafka**: Streaming de eventos
- **Amazon SQS**: Fila de mensagens AWS
- **Socket.io**: WebSocket em tempo real
- **Dify**: IA e gerenciamento de agentes
- **OpenAI**: Capacidades de IA e conversão de áudio
- **Amazon S3 / MinIO**: Armazenamento de mídia

---

## 📖 Documentação Adicional

### Webhooks
- **Documentação**: https://doc.evolution-api.com/v2/en/configuration/webhooks

### API Reference
- **Postman Collection**: https://evolution-api.com/postman
- **Documentação da API**: https://doc.evolution-api.com/v2/en/api

### Comunidade
- **WhatsApp Group**: https://evolution-api.com/whatsapp
- **Discord**: https://evolution-api.com/discord
- **GitHub Issues**: https://github.com/EvolutionAPI/evolution-api/issues

---

## 🆘 Suporte

### Suporte Premium
- **Evolution Pro**: https://evolution-api.com/suporte-pro
- Inclui suporte especializado e chamadas semanais

### Recursos da Comunidade
- Feature Requests: https://evolutionapi.canny.io/feature-requests
- Roadmap: https://evolutionapi.canny.io/feature-requests
- Changelog: https://evolutionapi.canny.io/changelog

---

## 📝 Versões

- **V2**: Requer versão 2.2.1 ou superior
- **V1**: Requer versão 1.8.4 ou superior

---

## ⚠️ Notas Importantes

1. **Telemetria**: A Evolution API coleta dados de uso (rotas acessadas, versão) para melhorias. Nenhum dado sensível é coletado.

2. **AUTHENTICATION_API_KEY**: É obrigatória e deve ser definida antes de iniciar o serviço.

3. **Volumes**: O volume `evolution_instances` armazena as sessões do WhatsApp. Mantenha backup regular.

4. **Health Checks**: Configure health checks adequados para produção.

5. **Logs**: Em produção, use `LOG_LEVEL=ERROR` ou `WARN` para reduzir verbosidade.

---

## 🔄 Atualização

Para atualizar a Evolution API:

```bash
docker pull evoapicloud/evolution-api:latest
docker compose down
docker compose up -d
```

---

**Última atualização**: Janeiro 2025
**Fonte**: Documentação oficial Evolution API (https://doc.evolution-api.com)
