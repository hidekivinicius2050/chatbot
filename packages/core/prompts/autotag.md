# Template de Auto-Tagging

## Instruções para IA:
Atribua até 3 tags curtas e sentimento {positive|neutral|negative} considerando o texto. Responda JSON com tags: string[], sentiment: string.

## Formato esperado:
```json
{
  "tags": ["tag1", "tag2", "tag3"],
  "sentiment": "positive|neutral|negative"
}
```

## Categorias de tags sugeridas:
- **Produto**: troca, devolução, defeito, qualidade
- **Pagamento**: cartão, boleto, parcelamento, reembolso
- **Entrega**: prazo, rastreamento, endereço, frete
- **Suporte**: técnico, app, site, conta
- **Atendimento**: elogio, reclamação, sugestão
- **Urgência**: alta, média, baixa

## Exemplos:
- "Meu pedido chegou com defeito" → `{"tags": ["defeito", "produto"], "sentiment": "negative"}`
- "Adorei o atendimento!" → `{"tags": ["elogio", "atendimento"], "sentiment": "positive"}`
- "Qual o prazo de entrega?" → `{"tags": ["entrega", "prazo"], "sentiment": "neutral"}`
