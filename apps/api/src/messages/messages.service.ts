import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  // Dados mock para mensagens
  private mockMessages = [
    {
      id: '1',
      ticketId: '1',
      content: 'Olá! Estou com problemas para enviar mensagens no WhatsApp Business. Pode me ajudar?',
      type: 'text',
      direction: 'inbound',
      sender: { name: 'João Silva', phone: '+5511999999999' },
      createdAt: new Date('2025-09-01T10:00:00Z'),
      status: 'delivered'
    },
    {
      id: '2',
      ticketId: '1',
      content: 'Claro! Vou te ajudar. Pode me dizer qual erro específico está aparecendo?',
      type: 'text',
      direction: 'outbound',
      sender: { name: 'Maria Santos', phone: '+5511222222222' },
      createdAt: new Date('2025-09-01T10:05:00Z'),
      status: 'delivered'
    },
    {
      id: '3',
      ticketId: '1',
      content: 'Aparece "Mensagem não pode ser enviada" para alguns contatos',
      type: 'text',
      direction: 'inbound',
      sender: { name: 'João Silva', phone: '+5511999999999' },
      createdAt: new Date('2025-09-01T10:10:00Z'),
      status: 'delivered'
    },
    {
      id: '4',
      ticketId: '2',
      content: 'Preciso configurar uma campanha de marketing para o lançamento do produto',
      type: 'text',
      direction: 'inbound',
      sender: { name: 'Ana Costa', phone: '+5511888888888' },
      createdAt: new Date('2025-09-02T14:00:00Z'),
      status: 'delivered'
    },
    {
      id: '5',
      ticketId: '2',
      content: 'Perfeito! Vou te guiar passo a passo. Primeiro, vamos definir o público-alvo.',
      type: 'text',
      direction: 'outbound',
      sender: { name: 'Pedro Oliveira', phone: '+5511333333333' },
      createdAt: new Date('2025-09-02T14:15:00Z'),
      status: 'delivered'
    }
  ];

  async create(createMessageDto: any, companyId: string) {
    const newMessage = {
      id: (this.mockMessages.length + 1).toString(),
      ...createMessageDto,
      createdAt: new Date(),
      status: 'sent'
    };
    
    this.mockMessages.push(newMessage);
    return newMessage;
  }

  async findAll(ticketId: string, query: any, companyId: string) {
    let filteredMessages = this.mockMessages.filter(msg => msg.ticketId === ticketId);
    
    // Simular paginação
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: filteredMessages.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: filteredMessages.length,
        totalPages: Math.ceil(filteredMessages.length / limit)
      }
    };
  }

  async findOne(id: string, companyId: string) {
    return this.mockMessages.find(message => message.id === id) || null;
  }

  async remove(id: string, companyId: string) {
    const messageIndex = this.mockMessages.findIndex(message => message.id === id);
    if (messageIndex === -1) return false;
    
    this.mockMessages.splice(messageIndex, 1);
    return true;
  }
}
