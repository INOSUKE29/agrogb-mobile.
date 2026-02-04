# 🚀 Comandos para Gerar o APK - Execute no PowerShell

## ✅ Node.js Instalado: v24.13.0

Execute estes comandos **no seu PowerShell** (um de cada vez):

---

## Passo 1: Instalar Dependências do Projeto
```powershell
cd C:\Users\Bruno\Documents\AgroGB\mobile_app
npm install
```

**O que vai acontecer:**
- Vai baixar todas as bibliotecas (Expo, React Native, SQLite, etc)
- Pode demorar 2-3 minutos
- Vai aparecer várias linhas de progresso

**Aguarde terminar antes de ir para o próximo passo!**

---

## Passo 2: Instalar Expo CLI
```powershell
npm install -g eas-cli
```

**O que vai acontecer:**
- Instala a ferramenta de build do Expo
- Demora ~1 minuto

---

## Passo 3: Fazer Login no Expo
```powershell
eas login
```

**O que vai acontecer:**
- Vai pedir seu email e senha do Expo
- Digite o email e senha da conta que você criou

---

## Passo 4: Gerar o APK
```powershell
eas build --platform android --profile preview
```

**O que vai acontecer:**
1. Vai perguntar se quer criar um projeto EAS → Digite **Y** (Yes)
2. Vai fazer upload do código (1-2 minutos)
3. Vai compilar na nuvem (5-10 minutos)
4. Vai te dar um link para baixar o APK

**Exemplo de saída:**
```
✔ Build finished
📱 Download: https://expo.dev/artifacts/eas/abc123.apk
```

---

## ❓ Se der erro

### Erro: "eas: command not found"
**Solução:** Feche e abra um novo PowerShell

### Erro: "Not logged in"
**Solução:** Execute `eas login` novamente

### Erro: "Project not configured"
**Solução:** Execute `eas build:configure` primeiro

---

## 📱 Depois de baixar o APK

1. Transfira o arquivo `.apk` para o celular
2. Abra o arquivo no celular
3. Permita "Instalar de fontes desconhecidas"
4. Instale o app
5. Teste registrando uma colheita!

---

**Me avise quando terminar cada passo ou se aparecer algum erro!** 🚀
