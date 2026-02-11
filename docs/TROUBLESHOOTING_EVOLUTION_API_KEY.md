# 🔑 Troubleshooting: AUTHENTICATION_API_KEY (Evolution API)

Este documento descreve erros comuns relacionados à **API Key** da Evolution API e como foram resolvidos no projeto Loja Multidepartamental.

---

## O que é a API Key?

A Evolution API exige uma chave de autenticação para todas as requisições:

- **Nome na Evolution API:** `AUTHENTICATION_API_KEY` (variável de ambiente dentro do container).
- **Nome no nosso projeto:** `EVOLUTION_API_KEY` (usada no `.env` e repassada ao Docker e ao backend).

Ela deve ser **a mesma** em dois lugares:

1. **Container da Evolution** – para a API aceitar requisições (header `apikey`).
2. **Backend NestJS** – para o módulo WhatsApp enviar mensagens e chamar a Evolution.

---

## Onde configurar

| Onde | Arquivo | Variável | Uso |
|------|---------|----------|-----|
| Projeto (Docker) | `.env` na **raiz** do projeto | `EVOLUTION_API_KEY` | Passada ao container como `AUTHENTICATION_API_KEY` |
| Backend | `backend/.env` | `EVOLUTION_API_KEY` | Header `apikey` nas chamadas à Evolution |

**Exemplo no `.env` da raiz:**

```env
EVOLUTION_API_KEY=sua-chave-segura-aqui
```

**Exemplo no `backend/.env`:**

```env
EVOLUTION_API_URL=http://localhost:8081
EVOLUTION_API_KEY=sua-chave-segura-aqui
EVOLUTION_INSTANCE_NAME=loja
```

Se não definir `EVOLUTION_API_KEY` no `.env` da raiz, o `docker-compose` usa o valor padrão `change-me` (apenas para desenvolvimento).

---

## Como achar a chave (passo a passo – testado no Windows)

Estes passos funcionam no **CMD** e no **PowerShell** do Windows.

### 1. Listar containers rodando

```cmd
docker ps
```

Confirme que existe o container **`loja-evolution-api`** (imagem `evoapicloud/evolution-api:latest`). No nosso projeto ele fica na porta **8081** (acesso em http://localhost:8081).

### 2. Ver a API Key Global no container

Execute (substitua pelo nome do container se for outro):

```cmd
docker exec -it loja-evolution-api env | findstr AUTHENTICATION_API_KEY
```

A saída será algo como:

```text
AUTHENTICATION_API_KEY=change-me
```

**O valor após o `=` é a sua API Key Global** – no exemplo acima é `change-me`. Copie esse valor.

### 3. Usar no Evolution Manager

- **Server URL:** `http://localhost:8081` (ou seu IP:8081)
- **API Key Global:** o valor obtido no passo 2 (ex.: `change-me`)

Com isso você faz login no Manager e cria/gerencia instâncias.

### 4. Trocar para uma chave segura (recomendado)

O valor `change-me` é **inseguro**. Para produção:

- **Opção A – Arquivo `.env`:** Na **raiz** do projeto, edite o `.env` e defina `EVOLUTION_API_KEY=uma-chave-forte-aqui`. Gere uma chave em [generate.plus/en/uuid](https://generate.plus/en/uuid) ou use 32+ caracteres aleatórios. Depois reinicie o container: `docker compose up -d` (no diretório onde está o `docker-compose.yml`).
- **Opção B – EasyPanel:** Se usar EasyPanel, vá em Apps > loja-evolution-api > Environment, edite `AUTHENTICATION_API_KEY`, salve e faça Rebuild/Restart. Rode o comando do passo 2 de novo para confirmar o novo valor.

Coloque a **mesma chave** no `backend/.env` em `EVOLUTION_API_KEY=` para o backend conseguir chamar a Evolution.

### 5. Testar a API com a chave

```cmd
curl -X GET http://localhost:8081/manager/info -H "apikey: change-me"
```

(Substitua `change-me` pela sua chave.) Deve retornar informações da API.

### ⚠️ Erro comum no CMD

**Não digite o nome do arquivo como comando.** O CMD não entende `docker-compose.yml` como comando.

- **Errado:** `docker-compose.yml` → "não é reconhecido como comando"
- **Certo:** Entre na pasta do projeto (onde está o `docker-compose.yml`) e rode:
  ```cmd
  docker compose up -d
  ```
  ou
  ```cmd
  docker-compose up -d
  ```

---

## Erro 1: "No such container: evolution-api"

### Sintoma

```text
Error response from daemon: No such container: evolution-api
```

ou

```text
error: no such object: evolution-api
```

### Causa

O nome do container da Evolution API **deste projeto** não é `evolution-api`. No `docker-compose.yml` o container se chama **`loja-evolution-api`**.

### Solução

Use sempre o nome correto do container:

```powershell
# ✅ Correto
docker exec loja-evolution-api sh -c "env | findstr AUTHENTICATION_API_KEY"

# ❌ Errado
docker exec evolution-api sh -c "env | findstr AUTHENTICATION_API_KEY"
```

**Listar containers da Evolution (qualquer projeto):**

```powershell
docker ps -a --filter "name=evolution"
```

No nosso projeto você deve ver `loja-evolution-api` (e opcionalmente `loja-evolution-postgres`).

---

## Erro 2: "Port 8080 already allocated" / container não inicia

### Sintoma

```text
Error response from daemon: failed to set up container networking: driver failed programming external connectivity on endpoint loja-evolution-api (...): Bind for 127.0.0.1:8080 failed: port is already allocated
```

O container `loja-evolution-api` fica em estado **Created** e não passa para **Up**.

### Causa

Outra aplicação já está usando a porta **8080** no host – por exemplo, outro container Evolution de outro projeto (`evolution_api`).

### Solução aplicada no projeto

O `docker-compose.yml` foi ajustado para que a Evolution API **deste projeto** use a porta **8081** no host:

- **Antes:** `"8080:8080"` e `SERVER_URL: http://localhost:8080`
- **Depois:** `"8081:8080"` e `SERVER_URL: http://localhost:8081`

Assim:

- Acesso à Evolution deste projeto: **http://localhost:8081**
- O outro Evolution continua em **http://localhost:8080** (sem conflito).

**No `backend/.env` use a porta correta:**

```env
# Se estiver usando a Evolution deste projeto (docker-compose):
EVOLUTION_API_URL=http://localhost:8081

# Se estiver usando outra Evolution já rodando na 8080:
EVOLUTION_API_URL=http://localhost:8080
```

Depois suba os serviços:

```powershell
docker-compose up -d
```

---

## Como verificar a API Key no container (Windows)

**Comando que funciona no CMD e no PowerShell** (testado e aprovado):

```cmd
docker exec -it loja-evolution-api env | findstr AUTHENTICATION_API_KEY
```

Saída esperada: `AUTHENTICATION_API_KEY=change-me` (ou o valor que você definiu). O que vem **após o `=`** é a chave.

**Alternativa no PowerShell:**

```powershell
docker exec loja-evolution-api sh -c "env | findstr AUTHENTICATION_API_KEY"
```

**Listar todas as variáveis e filtrar (PowerShell):**

```powershell
docker inspect loja-evolution-api --format '{{range .Config.Env}}{{println .}}{{end}}' | Select-String "AUTHENTICATION_API_KEY"
```

**Requisito:** o container precisa estar **rodando** (`Up`). Se aparecer "No such container", confira o nome com `docker ps -a --filter "name=evolution"` e use `loja-evolution-api`.

---

## Resumo das resoluções

| Problema | Causa | Resolução |
|----------|--------|------------|
| **Como achar a chave?** | Ver valor no container | `docker exec -it loja-evolution-api env \| findstr AUTHENTICATION_API_KEY` (valor após o `=`) |
| "No such container: evolution-api" | Nome do container errado | Usar `loja-evolution-api` em vez de `evolution-api` |
| Porta 8080 já alocada | Outro Evolution (ou app) na 8080 | Evolution deste projeto na porta **8081** no `docker-compose` |
| Onde fica a API Key? | Não é “encontrada” na Evolution, é definida por você | Definir `EVOLUTION_API_KEY` no `.env` (raiz e backend) |
| Comandos Linux não funcionam no CMD/PowerShell | `tr`, `grep` não existem no Windows | Usar `findstr` ou `Select-String` |
| "docker-compose.yml não é reconhecido" | Digitou o nome do arquivo como comando | Rodar `docker compose up -d` no diretório do projeto |

---

## Referências

- **Evolution API (env):** [doc.evolution-api.com – Variáveis de ambiente](https://doc.evolution-api.com/v2/en/env)
- **Instalação Docker:** [Evolution API v2 – Install Docker](https://doc.evolution-api.com/v2/pt/install/docker)
- **Este projeto:** `docker-compose.yml` (serviço `evolution-api`), `backend/.env.example`, `GUIA_RAPIDO.md` (seção Fase 6)
- **Webhook:** `docs/CONFIGURAR_WEBHOOK_EVOLUTION.md`
- **EasyPanel:** Se usar EasyPanel, edite variáveis em Apps > loja-evolution-api > Environment; logs com `docker logs loja-evolution-api`

---

**Última atualização:** Fevereiro 2026  
**Contexto:** Fase 6 – Integração WhatsApp (Evolution API)
