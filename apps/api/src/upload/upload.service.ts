import { Injectable, BadRequestException } from '@nestjs/common';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { extname, basename } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir = './uploads';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  constructor() {
    // Criar diretório de uploads se não existir
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; filename: string }> {
    // Validar tamanho do arquivo
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`Arquivo muito grande. Tamanho máximo: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Validar tipo MIME
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de arquivo não permitido');
    }

    // Gerar nome único para o arquivo
    const fileExtension = extname(file.originalname);
    const uniqueName = `${uuidv4()}${fileExtension}`;
    const filePath = `${this.uploadDir}/${uniqueName}`;

    // Salvar arquivo
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      
      writeStream.on('error', (error) => {
        reject(new BadRequestException('Erro ao salvar arquivo'));
      });

      writeStream.on('finish', () => {
        const url = `/uploads/${uniqueName}`;
        resolve({ url, filename: uniqueName });
      });

      writeStream.write(file.buffer);
      writeStream.end();
    });
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  getFilePath(filename: string): string {
    return `${this.uploadDir}/${filename}`;
  }
}
