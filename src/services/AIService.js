import { Alert } from 'react-native';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3️⃣ PROMPT INTERNO DA IA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const SYSTEM_PROMPT_ANALYSIS = `
VOCÊ É UMA IA AGRONÔMICA ESPECIALISTA.
SEU OBJETIVO: Analisar mídias (texto, imagem, PDF) e extrair dados técnicos estruturados.

ANTES DE RESPONDER:
1. Classificar o conteúdo em: DOENÇA, PRAGA, DEFICIÊNCIA, MANEJO, RECEITA, ARTIGO ou OBSERVAÇÃO.
2. Vincular obrigatoriamente a uma Cultura e Área (se identificável no texto).
3. Extrair: Sintomas, Causa Provável, Tipo de Problema, Controle (Bio/Químico/Cultural), Produtos/Dosagens.
4. Separar Fatos (Fonte) de Interpretação (IA).

SAÍDA ESPERADA (JSON):
{
  "classificacao_principal": "...",
  "sintomas": "...",
  "causa_provavel": "...",
  "tipo_problema": "...",
  "sugestao_controle": "...",
  "produtos": [ { "nome": "...", "dosagem": "..." } ],
  "observacoes_tecnicas": "...",
  "nivel_confianca_sugerido": "TÉCNICO"
}
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4️⃣ PROMPT DE RESPOSTA AO USUÁRIO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const USER_RESPONSE_TEMPLATE = `
FORMATO PADRÃO DE RESPOSTA:
1. O QUE FOI IDENTIFICADO: (Resumo claro)
2. POSSÍVEL CAUSA: (Agente causador)
3. MANEJO SUGERIDO: (Ações práticas)
4. OBSERVAÇÕES: (Contexto)
5. FONTE: (Origem da info)
6. ⚠️ AVISO: Esta análise é uma sugestão de IA e não substitui a visita de um Eng. Agrônomo.
`;

/**
 * Simula (ou realiza) a análise de Inteligência Artificial.
 * No futuro, substituir o 'mock' pela chamada real à API OpenAI/Gemini.
 */
export const analyzeContent = async (sourceUri, sourceType, mediaContent = null) => {
    // ---------------------------------------------------------
    // ROTEAMENTO DE EXECUÇÃO REAL VS SIMULAÇÃO
    // ---------------------------------------------------------
    console.log(`[AI SERVICE] processando: ${sourceType} -> ${sourceUri}`);

    // SIMULAÇÃO INTELIGENTE (Para demonstração do fluxo sem API Key)
    // Retorna uma análise estruturada baseada no "tipo" ou conteúdo mockado.

    return new Promise((resolve) => {
        setTimeout(() => {
            const mockAnalysis = {
                classificacao_principal: "Fitossanidade / Doença Fúngica",
                sintomas: "Manchas necróticas circulares com halo amarelado nas folhas baixas.",
                causa_provavel: "Fungo Alternaria solani (Pinta Preta)",
                tipo_problema: "DOENCA",
                sugestao_controle: "Realizar rotação de culturas. Aplicação preventiva de fungicidas cúpricos ou à base de Mancozeb.",
                produtos_citados: "Dithane, Recop",
                dosagem: "200g/100L (Exemplo Referencial)",
                forma_aplicacao: "Pulverização foliar",
                observacoes_tecnicas: "Favorecida por alta umidade e temperaturas entre 24-29°C.",
                fonte_informacao: "Análise IA via Base de Conhecimento (Embrapa/Manual)",
                nivel_confianca_sugerido: "TÉCNICO"
            };

            resolve({
                success: true,
                data: mockAnalysis,
                formattedResponse: formatUserResponse(mockAnalysis)
            });
        }, 2000); // 2s delay para "pensar"
    });
};

const formatUserResponse = (data) => {
    return `
🟢 1. IDENTIFICADO: ${data.classificacao_principal}

🔍 2. POSSÍVEL CAUSA: 
${data.causa_provavel}

🛠️ 3. MANEJO SUGERIDO:
${data.sugestao_controle}
Produtos citados: ${data.produtos_citados} (${data.dosagem})

📝 4. OBSERVAÇÕES:
${data.observacoes_tecnicas}

📚 5. FONTE: ${data.fonte_informacao}

⚠️ AVISO TÉCNICO: Sugestão gerada por IA. Confirme com um Responsável Técnico antes da aplicação.
    `.trim();
};
