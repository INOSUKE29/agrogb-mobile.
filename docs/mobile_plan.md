# Plano de Desenvolvimento: AgroGB Mobile

Este documento descreve as etapas para a criação do aplicativo móvel que sincronizará com a versão Desktop.

## Estrutura da Pasta `mobile_app`
- `src/`: Código fonte do aplicativo (React Native ou Flutter).
- `assets/`: Ícones e imagens.
- `docs/`: Documentação da API e fluxo de sincronização.

## Próximos Passos
1. **Definição de Tecnologia:** Escolher o framework (recomendado: React Native para facilidade de integração).
2. **Interface:** Criar mockups das telas de Colheita e Vendas (foco em uso no campo).
3. **Ponte de Sincronização:** Desenvolver a lógica que lê o banco SQLite local e envia via API.
