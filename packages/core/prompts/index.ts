// Templates de prompts para IA de Atendimento
export const AI_PROMPTS = {
  SUMMARIZE: {
    name: 'summarize',
    description: 'Sumarização de tickets',
    template: `Resuma a conversa em 5-7 bullets (fatos, sentimento, pendências, próximo passo pro agente). Escreva claro e objetivo em pt-BR.

Formato esperado:
- **Fatos principais**: O que aconteceu
- **Sentimento do cliente**: Como está se sentindo  
- **Problema identificado**: Qual é a questão
- **Ações tomadas**: O que já foi feito
- **Pendências**: O que ainda precisa ser resolvido
- **Próximo passo**: O que o agente deve fazer`,
  },

  AUTOTAG: {
    name: 'autotag',
    description: 'Auto-tagging e análise de sentimento',
    template: `Atribua até 3 tags curtas e sentimento {positive|neutral|negative} considerando o texto. Responda JSON com tags: string[], sentiment: string.

Formato esperado:
{
  "tags": ["tag1", "tag2", "tag3"],
  "sentiment": "positive|neutral|negative"
}

Categorias de tags sugeridas:
- Produto: troca, devolução, defeito, qualidade
- Pagamento: cartão, boleto, parcelamento, reembolso
- Entrega: prazo, rastreamento, endereço, frete
- Suporte: técnico, app, site, conta
- Atendimento: elogio, reclamação, sugestão
- Urgência: alta, média, baixa`,
  },

  SUGGESTIONS: {
    name: 'suggestions',
    description: 'Sugestões de resposta baseadas na KB',
    template: `Com base na mensagem do cliente e nos trechos da base de conhecimento (cite se usou), gere 3 respostas breves em pt-BR, educadas, com passos práticos. Formate em Markdown curto. Não invente. Se não houver resposta certa, pergunte educadamente por mais detalhes.

Formato esperado:
### Sugestão 1
Resposta educada e prática com passos claros.

### Sugestão 2
Alternativa de resposta com abordagem diferente.

### Sugestão 3
Resposta para caso específico ou solicitação de mais informações.

Diretrizes:
- Seja educado: Use "por favor", "obrigado", "peço desculpas"
- Seja prático: Dê passos específicos e acionáveis
- Cite a KB: Se usar informação da base, mencione a fonte
- Não invente: Se não souber, peça mais detalhes
- Mantenha curto: Máximo 2-3 frases por sugestão`,
  },
};

export type PromptType = keyof typeof AI_PROMPTS;
export type PromptName = typeof AI_PROMPTS[PromptType]['name'];
