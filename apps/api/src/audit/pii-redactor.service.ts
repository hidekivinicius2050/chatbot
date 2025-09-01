import { Injectable } from '@nestjs/common';
import { PiiRedactor } from './dto/audit.dto';

@Injectable()
export class PiiRedactorService implements PiiRedactor {
  redactPhone(phone: string): string {
    if (!phone || phone.length < 4) return phone;
    
    // Mantém código do país e últimos 2 dígitos
    const countryCode = phone.substring(0, phone.length - 6);
    const lastTwo = phone.substring(phone.length - 2);
    const masked = '*'.repeat(phone.length - countryCode.length - 2);
    
    return `${countryCode}${masked}${lastTwo}`;
  }

    redactEmail(email: string): string {
    if (!email || !email.includes('@')) return email;

    const [localPart, domain] = email.split('@');
    if (!localPart || localPart.length <= 1) return email;

    const firstChar = localPart[0];
    const masked = '*'.repeat(localPart.length - 1);

    return `${firstChar}${masked}@${domain}`;
  }

  redactName(name: string): string {
    if (!name || name.length <= 2) return name;
    
    const firstChar = name[0];
    const lastChar = name[name.length - 1];
    const masked = '*'.repeat(name.length - 2);
    
    return `${firstChar}${masked}${lastChar}`;
  }

  redactText(text: string): string {
    if (!text) return text;
    
    // Redação básica de texto - mantém apenas primeiros e últimos caracteres
    if (text.length <= 4) return '*'.repeat(text.length);
    
    const firstChar = text[0];
    const lastChar = text[text.length - 1];
    const masked = '*'.repeat(text.length - 2);
    
    return `${firstChar}${masked}${lastChar}`;
  }

  redactObject(obj: Record<string, any>): Record<string, any> {
    const redacted = { ...obj };
    
    // Campos sensíveis conhecidos
    const sensitiveFields = ['phone', 'email', 'name', 'password', 'token', 'secret'];
    
    for (const [key, value] of Object.entries(redacted)) {
      if (typeof value === 'string') {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          if (key.toLowerCase().includes('phone')) {
            redacted[key] = this.redactPhone(value);
          } else if (key.toLowerCase().includes('email')) {
            redacted[key] = this.redactEmail(value);
          } else if (key.toLowerCase().includes('name')) {
            redacted[key] = this.redactName(value);
          } else {
            redacted[key] = this.redactText(value);
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactObject(value);
      }
    }
    
    return redacted;
  }
}
