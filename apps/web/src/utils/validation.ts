// Validações para o sistema

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateApiKey = (apiKey: string): boolean => {
  // Validação básica para API key do OpenAI
  return apiKey.startsWith('sk-') && apiKey.length > 20
}

export const validatePhoneNumber = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '')
  // Verifica se tem pelo menos 10 dígitos
  return cleanPhone.length >= 10
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateTemperature = (temp: number): boolean => {
  return temp >= 0 && temp <= 2
}

export const validateSystemPrompt = (prompt: string): boolean => {
  return prompt.length >= 10 && prompt.length <= 2000
}

// Validações específicas para configuração de IA
export const validateAIConfig = (config: any) => {
  const errors: string[] = []

  if (config.openai?.apiKey && !validateApiKey(config.openai.apiKey)) {
    errors.push('API Key inválida. Deve começar com "sk-" e ter pelo menos 20 caracteres.')
  }

  if (config.openai?.temperature && !validateTemperature(config.openai.temperature)) {
    errors.push('Temperatura deve estar entre 0 e 2.')
  }

  if (config.openai?.systemPrompt && !validateSystemPrompt(config.openai.systemPrompt)) {
    errors.push('Prompt do sistema deve ter entre 10 e 2000 caracteres.')
  }

  if (config.whatsapp?.phoneNumber && !validatePhoneNumber(config.whatsapp.phoneNumber)) {
    errors.push('Número de telefone inválido.')
  }

  if (config.whatsapp?.webhookUrl && !validateUrl(config.whatsapp.webhookUrl)) {
    errors.push('URL do webhook inválida.')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
