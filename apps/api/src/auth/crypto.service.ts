import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly algorithm = 'aes-256-cbc';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits

  private getEncryptionKey(): Buffer {
    const key = process.env.DATA_ENC_KEY;
    if (!key) {
      this.logger.warn('DATA_ENC_KEY não configurada, usando chave de desenvolvimento');
      // Chave de desenvolvimento - NUNCA usar em produção
      const devKey = 'dev-key-32-bytes-long-for-aes-256';
      return Buffer.from(devKey, 'utf8').slice(0, 32);
    }

    try {
      const decoded = Buffer.from(key, 'base64');
      if (decoded.length !== 32) {
        throw new Error('Chave deve ter exatamente 32 bytes');
      }
      return decoded;
    } catch (error) {
      this.logger.error('Erro ao decodificar DATA_ENC_KEY:', error);
      throw new Error('DATA_ENC_KEY inválida');
    }
  }

  encrypt(data: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Formato: iv:encrypted
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      this.logger.error('Erro ao criptografar dados:', error);
      throw new Error('Falha na criptografia');
    }
  }

  decrypt(encryptedData: string): string {
    const key = this.getEncryptionKey();
    const parts = encryptedData.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Formato de dados criptografados inválido');
    }
    
    try {
      const [ivHex, encrypted] = parts;
      if (!ivHex || !encrypted) {
        throw new Error('Dados criptografados inválidos');
      }
      
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error('Erro ao descriptografar dados:', error);
      throw new Error('Falha na descriptografia');
    }
  }

  maskSecret(secret: string, visibleChars: number = 4): string {
    if (!secret || secret.length <= visibleChars) {
      return '*'.repeat(secret?.length || 0);
    }
    
    const visible = secret.slice(-visibleChars);
    const masked = '*'.repeat(secret.length - visibleChars);
    return masked + visible;
  }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
