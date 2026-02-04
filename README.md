# AgroGB Mobile - Guia de Instalação

## 📱 Sobre o Aplicativo

O **AgroGB Mobile** é a versão móvel do sistema de gestão rural AgroGB. Ele permite que você registre colheitas, vendas e consulte informações diretamente do campo, mesmo sem conexão com a internet.

## 🚀 Instalação e Configuração

### Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **React Native CLI**
3. **Android Studio** (para Android) ou **Xcode** (para iOS)

### Passo a Passo

1. **Instalar dependências:**
```bash
cd mobile_app
npm install
```

2. **Executar no Android:**
```bash
npm run android
```

3. **Executar no iOS:**
```bash
cd ios && pod install && cd ..
npm run ios
```

## 🔄 Como Funciona a Sincronização

### Fluxo de Dados

1. **Registro Offline:** Você registra colheitas no celular, mesmo sem internet
2. **Armazenamento Local:** Os dados ficam salvos no SQLite do celular
3. **Sincronização Automática:** Quando houver internet, o app envia os dados para o servidor
4. **Atualização Desktop:** O sistema Desktop recebe e mescla os dados automaticamente

### Identificação Única (UUID)

Cada registro criado no celular recebe um código único (UUID) como:
```
8f2d1a3c-b4e5-6789-1234-56789abcdef0
```

Isso garante que não haja conflitos quando o mesmo dado for criado no celular e no computador.

## 📊 Estrutura do Banco de Dados

### Tabela: colheitas
- `uuid` - Identificador único global
- `cultura` - Nome da área/cultura
- `produto` - Produto colhido
- `quantidade` - Quantidade em KG
- `data` - Data da colheita
- `last_updated` - Timestamp da última alteração
- `sync_status` - 0=Pendente, 1=Sincronizado

## 🎯 Próximos Passos

- [ ] Implementar API de sincronização
- [ ] Adicionar tela de vendas
- [ ] Criar dashboard offline
- [ ] Implementar notificações de sincronização
- [ ] Adicionar suporte a fotos de colheita

## 💡 Dicas de Uso

1. **Sempre registre no campo:** Não precisa esperar ter internet
2. **Sincronize regularmente:** Quando tiver WiFi, abra o app para sincronizar
3. **Backup automático:** Os dados ficam salvos tanto no celular quanto no Desktop

## 🔧 Troubleshooting

**Problema:** App não abre
- Solução: Verifique se todas as dependências foram instaladas com `npm install`

**Problema:** Erro de sincronização
- Solução: Verifique sua conexão com a internet e tente novamente

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do AgroGB Desktop.
