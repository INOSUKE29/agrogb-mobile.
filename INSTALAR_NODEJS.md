# 📦 Instalação do Node.js - Pré-requisito para Build Mobile

## ❌ Problema Detectado
O comando `npm` não foi encontrado, o que significa que o **Node.js não está instalado** no seu PC.

## ✅ Solução: Instalar Node.js

### Passo 1: Baixar o Node.js

1. Acesse: **https://nodejs.org/**
2. Clique no botão verde **"LTS"** (versão recomendada)
3. Baixe o instalador para Windows (arquivo `.msi`)

### Passo 2: Instalar

1. Execute o arquivo baixado
2. Clique em **"Next"** em todas as etapas
3. **IMPORTANTE:** Marque a opção **"Automatically install necessary tools"**
4. Aguarde a instalação (pode levar 5-10 minutos)
5. Clique em **"Finish"**

### Passo 3: Verificar Instalação

Abra um **novo** PowerShell e execute:

```powershell
node --version
npm --version
```

Você deve ver algo como:
```
v20.11.0
10.2.4
```

---

## 🚀 Depois da Instalação

Quando o Node.js estiver instalado, volte aqui e execute:

### 1. Instalar Dependências do Projeto
```powershell
cd C:\Users\Bruno\Documents\AgroGB\mobile_app
npm install
```

### 2. Instalar Expo CLI
```powershell
npm install -g eas-cli
```

### 3. Fazer Login no Expo

Primeiro, crie uma conta gratuita em: **https://expo.dev/signup**

Depois execute:
```powershell
eas login
```

Digite seu email e senha do Expo.

### 4. Gerar o APK
```powershell
eas build --platform android --profile preview
```

---

## ⏱️ Tempo Estimado

- Download do Node.js: 2 minutos
- Instalação do Node.js: 5-10 minutos
- Instalação das dependências: 3-5 minutos
- Build do APK na nuvem: 5-10 minutos

**Total: ~20-30 minutos**

---

## 💡 Dica

Enquanto o Node.js instala, você pode:
1. Criar sua conta no Expo: https://expo.dev/signup
2. Confirmar o email
3. Anotar seu login e senha

Assim quando a instalação terminar, você já pode fazer login direto!

---

## ❓ Dúvidas Comuns

**P: Preciso reiniciar o PC?**
R: Não, mas você precisa **fechar e abrir um novo PowerShell** após a instalação.

**P: O Node.js é seguro?**
R: Sim! É usado por milhões de desenvolvedores no mundo todo.

**P: Ocupa muito espaço?**
R: Aproximadamente 200MB.

---

## 📞 Próximo Passo

Depois de instalar o Node.js, me avise que eu te ajudo com os comandos seguintes!
