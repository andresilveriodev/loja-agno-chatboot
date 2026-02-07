# 🐳 Guia Completo: Instalação Evolution API com Docker Compose

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Passo a Passo da Instalação](#passo-a-passo-da-instalação)
4. [Configuração](#configuração)
5. [Testes e Validação](#testes-e-validação)
6. [Uso Diário](#uso-diário)
7. [Troubleshooting](#troubleshooting)
8. [Referências](#referências)

---

## 📖 Visão Geral

Este guia documenta o processo **completo e testado** de instalação da Evolution API usando Docker Compose, que foi implementado com sucesso no projeto Sítio Multitrem.

### ✅ O que será instalado:

- **Evolution API** v2.3.7 (Container Docker)
- **PostgreSQL** 15 (Container Docker)
- **Redis** latest (Container Docker)
- **Evolution Frontend** (Container Docker - opcional)

### 🎯 Resultado Final:

- API funcionando em `http://localhost:8080`
- PostgreSQL rodando internamente
- Redis rodando internamente
- Instância WhatsApp criada e pronta para uso

---

## 🔧 Pré-requisitos

### 1. **Docker Desktop**

Certifique-se de que o Docker Desktop está instalado e **rodando**:

```powershell
# Verificar versão do Docker
docker --version
# Deve retornar: Docker version 29.1.2 ou superior

# Verificar se está rodando
docker ps
# Deve listar containers (ou estar vazio, mas sem erro)
```

Se o Docker não estiver instalado:
- Download: https://www.docker.com/products/docker-desktop/
- Instale e reinicie o computador

### 2. **Node.js**

Necessário para executar os scripts de teste:

```powershell
# Verificar versão
node --version
# Deve retornar: v20.0.0 ou superior
```

### 3. **Git**

Para clonar o repositório:

```powershell
git --version
```

---

## 🚀 Passo a Passo da Instalação

### **PASSO 1: Clonar o Repositório da Evolution API**

```powershell
# Navegar até a pasta de serviços do projeto
cd "C:\Users\ilumi\Desktop\En\Adriano\E-commerce 02\services"

# Clonar o repositório oficial
git clone https://github.com/EvolutionAPI/evolution-api.git

# Entrar na pasta
cd evolution-api
```

**✅ Resultado esperado:** Pasta `evolution-api` criada com todos os arquivos.

---

### **PASSO 2: Instalar Dependências do Node.js**

```powershell
# Dentro da pasta evolution-api
npm install
```

**✅ Resultado esperado:** Pasta `node_modules` criada com todas as dependências.

**⏱️ Tempo estimado:** 2-5 minutos

---

### **PASSO 3: Configurar o Arquivo .env**

#### 3.1. Copiar o arquivo de exemplo:

```powershell
Copy-Item .env.example .env
```

#### 3.2. Gerar uma API Key segura:

```powershell
# Gerar API Key com PowerShell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$apiKey = [Convert]::ToBase64String($bytes)
Write-Host "API Key gerada: $apiKey"
$apiKey
```

**📝 Anote a API Key gerada!** Exemplo:
```
W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA=
```

#### 3.3. Atualizar variáveis no .env:

Execute os comandos abaixo **um por vez**, substituindo `SUA_API_KEY` pela chave gerada:

```powershell
# Atualizar AUTHENTICATION_API_KEY
$apiKey = "W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA="  # ⚠️ USE SUA API KEY!
$content = Get-Content .env -Raw
$content = $content -replace 'AUTHENTICATION_API_KEY=.*', "AUTHENTICATION_API_KEY=$apiKey"
Set-Content .env $content

# Atualizar DATABASE_CONNECTION_URI para usar o nome do container Docker
$content = Get-Content .env -Raw
$content = $content -replace 'DATABASE_CONNECTION_URI=postgresql://.*', 'DATABASE_CONNECTION_URI=postgresql://evolution:evolution123@evolution-postgres:5432/evolution'
Set-Content .env $content

# Atualizar CACHE_REDIS_URI para usar o nome do container Docker
$content = Get-Content .env -Raw
$content = $content -replace 'CACHE_REDIS_URI=redis://localhost:6379/6', 'CACHE_REDIS_URI=redis://evolution-redis:6379/6'
Set-Content .env $content

# Adicionar variáveis do PostgreSQL para o Docker Compose
Add-Content .env "`n# PostgreSQL Docker Configuration`nPOSTGRES_DATABASE=evolution`nPOSTGRES_USERNAME=evolution`nPOSTGRES_PASSWORD=evolution123"
```

**✅ Resultado esperado:** Arquivo `.env` configurado com:
- API Key personalizada
- Database URI apontando para `evolution-postgres`
- Redis URI apontando para `evolution-redis`
- Variáveis POSTGRES_* adicionadas

---

### **PASSO 4: Ajustar o docker-compose.yaml**

#### 4.1. Ler o arquivo atual:

```powershell
Get-Content docker-compose.yaml
```

#### 4.2. Fazer os ajustes necessários:

**Problema identificado:** O `docker-compose.yaml` original tem:
- Porta 3000 (conflita com o frontend Next.js)
- Rede `dokploy-network` (não existe)
- Variáveis de ambiente não são passadas para o container

**Solução:** Edite o arquivo `docker-compose.yaml` manualmente ou use os comandos abaixo:

##### **Ajuste 1: Mudar porta do frontend de 3000 para 3001**

Abra o arquivo `docker-compose.yaml` em um editor de texto e localize:

```yaml
  frontend:
    container_name: evolution_frontend
    image: evoapicloud/evolution-manager:latest
    restart: always
    ports:
      - "3000:80"  # ⚠️ MUDAR PARA 3001
```

Altere para:

```yaml
  frontend:
    container_name: evolution_frontend
    image: evoapicloud/evolution-manager:latest
    restart: always
    ports:
      - "3001:80"  # ✅ Porta alterada
```

##### **Ajuste 2: Remover rede dokploy-network**

Localize todas as ocorrências de `dokploy-network` e remova. Exemplo:

**ANTES:**
```yaml
    networks:
      - evolution-net
      - dokploy-network  # ⚠️ REMOVER
```

**DEPOIS:**
```yaml
    networks:
      - evolution-net  # ✅ Apenas evolution-net
```

Também remova no final do arquivo:

**ANTES:**
```yaml
networks:
  evolution-net:
    name: evolution-net
    driver: bridge
  dokploy-network:  # ⚠️ REMOVER ESTA SEÇÃO
    external: true
```

**DEPOIS:**
```yaml
networks:
  evolution-net:
    name: evolution-net
    driver: bridge
```

##### **Ajuste 3: Adicionar variáveis de ambiente no serviço API**

Localize o serviço `api` e adicione a seção `environment`:

**ANTES:**
```yaml
  api:
    container_name: evolution_api
    image: evoapicloud/evolution-api:latest
    restart: always
    depends_on:
      - redis
      - evolution-postgres
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - evolution_instances:/evolution/instances
    networks:
      - evolution-net
    env_file:
      - .env
    expose:
      - "8080"
```

**DEPOIS:**
```yaml
  api:
    container_name: evolution_api
    image: evoapicloud/evolution-api:latest
    restart: always
    depends_on:
      - redis
      - evolution-postgres
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - evolution_instances:/evolution/instances
    networks:
      - evolution-net
    env_file:
      - .env
    environment:  # ✅ ADICIONAR ESTA SEÇÃO
      - CACHE_REDIS_ENABLED=true
      - CACHE_REDIS_URI=redis://evolution-redis:6379/6
      - DATABASE_CONNECTION_URI=postgresql://evolution:evolution123@evolution-postgres:5432/evolution
      - DATABASE_PROVIDER=postgresql
    expose:
      - "8080"
```

**✅ Resultado esperado:** Arquivo `docker-compose.yaml` ajustado e pronto para uso.

---

### **PASSO 5: Iniciar os Serviços com Docker Compose**

#### 5.1. Remover containers antigos (se existirem):

```powershell
# Parar e remover containers antigos
docker stop evolution-postgres evolution-redis evolution-api 2>$null
docker rm evolution-postgres evolution-redis evolution-api 2>$null
```

#### 5.2. Iniciar todos os serviços:

```powershell
docker-compose up -d
```

**✅ Resultado esperado:**
```
Container evolution_postgres  Started
Container evolution_redis  Started
Container evolution_api  Started
Container evolution_frontend  Started
```

#### 5.3. Aguardar inicialização (15 segundos):

```powershell
Start-Sleep -Seconds 15
```

#### 5.4. Verificar status dos containers:

```powershell
docker ps --filter "name=evolution" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**✅ Resultado esperado:**
```
NAMES                STATUS                          PORTS
evolution_api        Up 1 minute                     127.0.0.1:8080->8080/tcp
evolution_postgres   Up 1 minute                     5432/tcp
evolution_redis      Up 1 minute                     6379/tcp
evolution_frontend   Up 1 minute                     0.0.0.0:3001->80/tcp
```

#### 5.5. Verificar logs da API:

```powershell
docker logs evolution_api --tail 30
```

**✅ Resultado esperado (últimas linhas):**
```
[Evolution API] v2.3.7 - VERBOSE [Redis] redis ready
[Evolution API] v2.3.7 - INFO [PrismaRepository] Repository:Prisma - ON
[Evolution API] v2.3.7 - LOG [SERVER] HTTP - ON: 8080
```

**🎉 Se você viu essas mensagens, a API está funcionando!**

---

### **PASSO 6: Criar Scripts de Teste**

Crie os seguintes arquivos para facilitar o uso:

#### 6.1. **test-api.js** - Testar a API

```powershell
# Criar o arquivo
New-Item -Path "test-api.js" -ItemType File -Force
```

Cole o conteúdo:

```javascript
const API_URL = 'http://localhost:8080';
const API_KEY = 'W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA='; // ⚠️ USE SUA API KEY!

async function testAPI() {
  console.log('🧪 Testando Evolution API...\n');

  try {
    console.log('1️⃣ Health Check...');
    const healthResponse = await fetch(`${API_URL}`);
    const healthData = await healthResponse.text();
    console.log('✅ API está respondendo!');
    console.log('Resposta:', healthData.substring(0, 100) + '...\n');

    console.log('2️⃣ Listando instâncias...');
    const instancesResponse = await fetch(`${API_URL}/instance/fetchInstances`, {
      method: 'GET',
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!instancesResponse.ok) {
      throw new Error(`Erro HTTP: ${instancesResponse.status}`);
    }

    const instances = await instancesResponse.json();
    console.log('✅ Instâncias encontradas:', instances.length);
    
    if (instances.length > 0) {
      console.log('\n📋 Instâncias:');
      instances.forEach((inst, index) => {
        console.log(`  ${index + 1}. ${inst.instanceName} - Status: ${inst.status || 'N/A'}`);
      });
    } else {
      console.log('ℹ️  Nenhuma instância criada ainda.');
    }

    console.log('\n✅ Todos os testes passaram!');
    console.log('\n📝 Próximo passo: Criar uma instância do WhatsApp');
    console.log('Execute: node create-instance.js');

  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    process.exit(1);
  }
}

testAPI();
```

#### 6.2. **create-instance.js** - Criar instância do WhatsApp

```javascript
const API_URL = 'http://localhost:8080';
const API_KEY = 'W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA='; // ⚠️ USE SUA API KEY!
const INSTANCE_NAME = 'sitio-multitrem';

async function createInstance() {
  console.log('📱 Criando instância do WhatsApp...\n');

  try {
    const response = await fetch(`${API_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instanceName: INSTANCE_NAME,
        token: API_KEY,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Instância criada com sucesso!');
    console.log('\n📋 Detalhes da instância:');
    console.log(`  Nome: ${data.instance?.instanceName || INSTANCE_NAME}`);
    console.log(`  Status: ${data.instance?.status || 'Criada'}`);
    
    if (data.hash) {
      console.log(`  Hash: ${data.hash}`);
    }

    console.log('\n📝 Próximo passo: Conectar ao WhatsApp Web');
    console.log('Execute: node connect-whatsapp.js');

  } catch (error) {
    console.error('❌ Erro ao criar instância:', error.message);
    
    console.log('\n🔍 Verificando se a instância já existe...');
    try {
      const checkResponse = await fetch(`${API_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'apikey': API_KEY,
        },
      });
      
      const instances = await checkResponse.json();
      const existing = instances.find(i => i.instanceName === INSTANCE_NAME);
      
      if (existing) {
        console.log(`✅ A instância "${INSTANCE_NAME}" já existe!`);
        console.log('Status:', existing.status || 'N/A');
        console.log('\n📝 Próximo passo: Conectar ao WhatsApp Web');
        console.log('Execute: node connect-whatsapp.js');
      }
    } catch (checkError) {
      console.error('Erro ao verificar instâncias:', checkError.message);
    }
  }
}

createInstance();
```

#### 6.3. **connect-whatsapp.js** - Conectar ao WhatsApp Web

```javascript
const API_URL = 'http://localhost:8080';
const API_KEY = 'W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA='; // ⚠️ USE SUA API KEY!
const INSTANCE_NAME = 'sitio-multitrem';

async function connectWhatsApp() {
  console.log('📱 Conectando ao WhatsApp Web...\n');

  try {
    console.log('1️⃣ Iniciando conexão...');
    const connectResponse = await fetch(`${API_URL}/instance/connect/${INSTANCE_NAME}`, {
      method: 'GET',
      headers: {
        'apikey': API_KEY,
      },
    });

    if (!connectResponse.ok) {
      const errorText = await connectResponse.text();
      throw new Error(`Erro ao conectar: ${errorText}`);
    }

    const connectData = await connectResponse.json();
    console.log('✅ Conexão iniciada!');

    console.log('\n2️⃣ Obtendo QR Code...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const qrResponse = await fetch(`${API_URL}/instance/connect/${INSTANCE_NAME}`, {
      method: 'GET',
      headers: {
        'apikey': API_KEY,
      },
    });

    const qrData = await qrResponse.json();
    
    if (qrData.base64) {
      console.log('✅ QR Code gerado!');
      console.log('\n📱 COMO CONECTAR:');
      console.log('1. Abra o WhatsApp no seu celular');
      console.log('2. Vá em Configurações > Aparelhos conectados');
      console.log('3. Toque em "Conectar um aparelho"');
      console.log('4. Escaneie o QR Code abaixo:\n');
      console.log('🔗 QR Code (base64):');
      console.log(qrData.base64.substring(0, 100) + '...');
      console.log('\n💡 Dica: Você também pode acessar:');
      console.log(`   http://localhost:8080/instance/connect/${INSTANCE_NAME}`);
      console.log('   E escanear o QR Code direto no navegador!');
    } else if (qrData.instance?.state === 'open') {
      console.log('✅ WhatsApp já está conectado!');
      console.log(`📱 Número: ${qrData.instance.number || 'N/A'}`);
    } else {
      console.log('⏳ QR Code ainda não foi gerado.');
      console.log('Aguarde alguns segundos e tente novamente.');
      console.log('\n💡 Você pode acessar o QR Code em:');
      console.log(`   http://localhost:8080/instance/connect/${INSTANCE_NAME}`);
    }

    console.log('\n3️⃣ Verificando status...');
    const statusResponse = await fetch(`${API_URL}/instance/fetchInstances?instanceName=${INSTANCE_NAME}`, {
      method: 'GET',
      headers: {
        'apikey': API_KEY,
      },
    });

    const instances = await statusResponse.json();
    const instance = instances[0];

    if (instance) {
      console.log('✅ Status da instância:');
      console.log(`  Nome: ${instance.instanceName}`);
      console.log(`  Status: ${instance.status || 'N/A'}`);
      console.log(`  Estado: ${instance.state || 'N/A'}`);
    }

    console.log('\n📝 Próximo passo:');
    console.log('1. Escaneie o QR Code com seu WhatsApp');
    console.log('2. Aguarde a conexão ser estabelecida');
    console.log('3. Execute: node test-send-message.js');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n💡 Tente acessar diretamente no navegador:');
    console.log(`   http://localhost:8080/instance/connect/${INSTANCE_NAME}`);
  }
}

connectWhatsApp();
```

#### 6.4. **test-send-message.js** - Testar envio de mensagem

```javascript
const API_URL = 'http://localhost:8080';
const API_KEY = 'W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA='; // ⚠️ USE SUA API KEY!
const INSTANCE_NAME = 'sitio-multitrem';

// ⚠️ CONFIGURE AQUI: Seu número de WhatsApp para teste (formato: 5511999999999)
const TEST_NUMBER = '5511999999999'; // ⚠️ ALTERE PARA SEU NÚMERO!

async function testSendMessage() {
  console.log('📱 Testando envio de mensagem...\n');

  try {
    console.log('1️⃣ Verificando conexão...');
    const statusResponse = await fetch(`${API_URL}/instance/connectionState/${INSTANCE_NAME}`, {
      method: 'GET',
      headers: {
        'apikey': API_KEY,
      },
    });

    const statusData = await statusResponse.json();
    console.log('Status:', statusData);

    if (statusData.state !== 'open') {
      console.log('❌ WhatsApp não está conectado!');
      console.log('Execute: node connect-whatsapp.js');
      console.log('E escaneie o QR Code primeiro.');
      return;
    }

    console.log('✅ WhatsApp conectado!');

    console.log('\n2️⃣ Enviando mensagem de teste...');
    
    const messageResponse = await fetch(`${API_URL}/message/sendText/${INSTANCE_NAME}`, {
      method: 'POST',
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: TEST_NUMBER,
        text: '🌱 Olá! Esta é uma mensagem de teste do Sítio Multitrem via Evolution API! 🥬',
      }),
    });

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      throw new Error(`Erro ao enviar mensagem: ${errorText}`);
    }

    const messageData = await messageResponse.json();
    console.log('✅ Mensagem enviada com sucesso!');
    console.log('Detalhes:', JSON.stringify(messageData, null, 2));

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Verifique se recebeu a mensagem no WhatsApp');
    console.log('2. Integre com o whatsapp-service do projeto');
    console.log('3. Configure webhooks para receber mensagens');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.message.includes('not connected')) {
      console.log('\n💡 O WhatsApp não está conectado.');
      console.log('Execute: node connect-whatsapp.js');
    } else if (TEST_NUMBER === '5511999999999') {
      console.log('\n⚠️  ATENÇÃO: Você precisa configurar seu número de teste!');
      console.log('Edite o arquivo test-send-message.js e altere a variável TEST_NUMBER');
    }
  }
}

testSendMessage();
```

**⚠️ IMPORTANTE:** Lembre-se de substituir `W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA=` pela sua API Key em todos os scripts!

---

## ✅ Testes e Validação

### **Teste 1: Verificar se a API está respondendo**

```powershell
node test-api.js
```

**✅ Resultado esperado:**
```
🧪 Testando Evolution API...

1️⃣ Health Check...
✅ API está respondendo!
Resposta: {"status":200,"message":"Welcome to the Evolution API, it is working!"...

2️⃣ Listando instâncias...
✅ Instâncias encontradas: 0
ℹ️  Nenhuma instância criada ainda.

✅ Todos os testes passaram!
```

---

### **Teste 2: Criar instância do WhatsApp**

```powershell
node create-instance.js
```

**✅ Resultado esperado:**
```
📱 Criando instância do WhatsApp...

✅ Instância criada com sucesso!

📋 Detalhes da instância:
  Nome: sitio-multitrem
  Status: connecting
  Hash: W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA=

📝 Próximo passo: Conectar ao WhatsApp Web
Execute: node connect-whatsapp.js
```

---

### **Teste 3: Conectar ao WhatsApp Web**

```powershell
node connect-whatsapp.js
```

**✅ Resultado esperado:**
```
📱 Conectando ao WhatsApp Web...

1️⃣ Iniciando conexão...
✅ Conexão iniciada!

2️⃣ Obtendo QR Code...
✅ QR Code gerado!

📱 COMO CONECTAR:
1. Abra o WhatsApp no seu celular
2. Vá em Configurações > Aparelhos conectados
3. Toque em "Conectar um aparelho"
4. Escaneie o QR Code abaixo:

🔗 QR Code (base64):
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVwAAAFcCAYAAACEFgYsAAAi/klEQVR4AezB0Q0lSa5kwdOJEsLloh...

💡 Dica: Você também pode acessar:
   http://localhost:8080/instance/connect/sitio-multitrem
   E escanear o QR Code direto no navegador!
```

**📱 Agora escaneie o QR Code com seu WhatsApp!**

---

### **Teste 4: Enviar mensagem de teste**

1. **Edite o arquivo** `test-send-message.js`:
   ```javascript
   const TEST_NUMBER = '5511999999999'; // ⚠️ ALTERE PARA SEU NÚMERO!
   ```

2. **Execute:**
   ```powershell
   node test-send-message.js
   ```

**✅ Resultado esperado:**
```
📱 Testando envio de mensagem...

1️⃣ Verificando conexão...
Status: { state: 'open' }
✅ WhatsApp conectado!

2️⃣ Enviando mensagem de teste...
✅ Mensagem enviada com sucesso!

🎉 Teste concluído com sucesso!
```

---

## 📚 Uso Diário

### **Iniciar os serviços**

```powershell
cd "C:\Users\ilumi\Desktop\En\Adriano\E-commerce 02\services\evolution-api"
docker-compose up -d
```

### **Parar os serviços**

```powershell
docker-compose down
```

### **Ver logs**

```powershell
# Logs da API
docker logs evolution_api --tail 50 -f

# Logs do PostgreSQL
docker logs evolution_postgres --tail 50 -f

# Logs do Redis
docker logs evolution_redis --tail 50 -f
```

### **Reiniciar um serviço específico**

```powershell
# Reiniciar apenas a API
docker-compose restart api

# Reiniciar todos
docker-compose restart
```

### **Ver status dos containers**

```powershell
docker-compose ps
```

---

## 🐛 Troubleshooting

### **Problema 1: API não está respondendo**

**Sintomas:**
- `curl http://localhost:8080` retorna erro
- `docker logs evolution_api` mostra erros

**Solução:**

```powershell
# 1. Verificar se o container está rodando
docker ps --filter "name=evolution_api"

# 2. Ver logs completos
docker logs evolution_api --tail 100

# 3. Reiniciar o container
docker-compose restart api

# 4. Se não resolver, recriar o container
docker-compose down
docker-compose up -d
```

---

### **Problema 2: Erro de conexão com Redis**

**Sintomas:**
```
[ERROR] [Redis] redis disconnected
```

**Solução:**

```powershell
# 1. Verificar se o Redis está rodando
docker ps --filter "name=evolution_redis"

# 2. Verificar se a variável CACHE_REDIS_URI está correta no .env
Get-Content .env | Select-String "CACHE_REDIS_URI"
# Deve ser: redis://evolution-redis:6379/6

# 3. Reiniciar o Redis
docker-compose restart redis

# 4. Reiniciar a API
docker-compose restart api
```

---

### **Problema 3: Erro de conexão com PostgreSQL**

**Sintomas:**
```
[ERROR] [Prisma] Can't reach database server
```

**Solução:**

```powershell
# 1. Verificar se o PostgreSQL está rodando
docker ps --filter "name=evolution_postgres"

# 2. Verificar se a variável DATABASE_CONNECTION_URI está correta
Get-Content .env | Select-String "DATABASE_CONNECTION_URI"
# Deve ser: postgresql://evolution:evolution123@evolution-postgres:5432/evolution

# 3. Testar conexão com o PostgreSQL
docker exec evolution_postgres psql -U evolution -d evolution -c "SELECT 1;"

# 4. Reiniciar o PostgreSQL
docker-compose restart evolution-postgres

# 5. Reiniciar a API
docker-compose restart api
```

---

### **Problema 4: Porta 8080 já está em uso**

**Sintomas:**
```
Error: bind: address already in use
```

**Solução:**

```powershell
# 1. Verificar o que está usando a porta 8080
netstat -ano | Select-String ":8080"

# 2. Matar o processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F

# 3. Ou alterar a porta no docker-compose.yaml
# Mudar de "127.0.0.1:8080:8080" para "127.0.0.1:8081:8080"
```

---

### **Problema 5: QR Code não aparece**

**Sintomas:**
- Script retorna "QR Code ainda não foi gerado"
- Navegador não mostra o QR Code

**Solução:**

```powershell
# 1. Aguardar mais tempo (10-15 segundos)
Start-Sleep -Seconds 15

# 2. Verificar status da instância
node test-api.js

# 3. Acessar diretamente no navegador
# http://localhost:8080/instance/connect/sitio-multitrem

# 4. Ver logs da API
docker logs evolution_api --tail 50

# 5. Recriar a instância
# Deletar a instância antiga via API ou Swagger
# http://localhost:8080/docs
```

---

### **Problema 6: Docker Desktop não está rodando**

**Sintomas:**
```
error during connect: This error may indicate that the docker daemon is not running
```

**Solução:**

```powershell
# 1. Iniciar o Docker Desktop manualmente
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# 2. Aguardar 30 segundos
Start-Sleep -Seconds 30

# 3. Verificar se está rodando
docker ps
```

---

## 🔗 Referências

### **URLs Importantes**

| Recurso | URL |
|---------|-----|
| **API** | http://localhost:8080 |
| **Swagger Docs** | http://localhost:8080/docs |
| **Frontend** | http://localhost:3001 |
| **QR Code** | http://localhost:8080/instance/connect/sitio-multitrem |

### **Documentação Oficial**

- **Evolution API:** https://doc.evolution-api.com/
- **GitHub:** https://github.com/EvolutionAPI/evolution-api
- **Docker Compose:** https://docs.docker.com/compose/

### **Arquivos do Projeto**

- `docker-compose.yaml` - Configuração dos containers
- `.env` - Variáveis de ambiente
- `test-api.js` - Script de teste da API
- `create-instance.js` - Script para criar instância
- `connect-whatsapp.js` - Script para conectar ao WhatsApp
- `test-send-message.js` - Script para testar envio de mensagens

---

## 📝 Checklist de Instalação

Use este checklist para garantir que tudo foi instalado corretamente:

- [ ] Docker Desktop instalado e rodando
- [ ] Node.js v20+ instalado
- [ ] Repositório Evolution API clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] API Key gerada
- [ ] Arquivo `.env` configurado
- [ ] Arquivo `docker-compose.yaml` ajustado
- [ ] Containers iniciados (`docker-compose up -d`)
- [ ] API respondendo em `http://localhost:8080`
- [ ] Scripts de teste criados
- [ ] Teste 1: API funcionando (`node test-api.js`)
- [ ] Teste 2: Instância criada (`node create-instance.js`)
- [ ] Teste 3: QR Code gerado (`node connect-whatsapp.js`)
- [ ] QR Code escaneado com WhatsApp
- [ ] WhatsApp conectado
- [ ] Teste 4: Mensagem enviada (`node test-send-message.js`)

---

## 🎉 Conclusão

Se você seguiu todos os passos deste guia, agora você tem:

✅ Evolution API rodando em Docker  
✅ PostgreSQL e Redis configurados  
✅ Instância WhatsApp criada  
✅ Scripts de teste funcionando  
✅ Documentação completa para referência futura  

**🚀 Próximos passos:**

1. Integrar com o `whatsapp-service` do projeto
2. Configurar webhooks para receber mensagens
3. Implementar funcionalidades de chat automatizado
4. Conectar com o AI-Service (Agno)

---

**📅 Data de criação:** 07/01/2026  
**✍️ Autor:** Documentação gerada durante a instalação bem-sucedida  
**🔖 Versão:** Evolution API v2.3.7  
**💻 Sistema:** Windows 10/11 com Docker Desktop  

---

**⚠️ IMPORTANTE:** Guarde este documento! Ele contém todos os passos testados e validados para instalar a Evolution API no futuro.





