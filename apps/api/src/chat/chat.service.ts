import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // Dados mock para conversas
  private mockConversations = [
    {
      id: '1',
      customerName: 'João Silva',
      customerPhone: '+5511999999999',
      customerAvatar: null,
      lastMessage: 'Preciso de ajuda com meu pedido #12345',
      lastMessageAt: new Date('2025-09-03T15:30:00Z'),
      status: 'active',
      priority: 'high',
      unreadCount: 2,
      channel: 'whatsapp',
      assignedTo: { name: 'Maria Santos', email: 'maria@chatbot.com' },
      createdAt: new Date('2025-09-01T10:00:00Z'),
      updatedAt: new Date('2025-09-03T15:30:00Z'),
      tags: ['suporte', 'pedido'],
      category: 'Suporte Técnico'
    },
    {
      id: '2',
      customerName: 'Ana Costa',
      customerPhone: '+5511888888888',
      customerAvatar: null,
      lastMessage: 'Obrigado pela ajuda!',
      lastMessageAt: new Date('2025-09-03T14:15:00Z'),
      status: 'resolved',
      priority: 'normal',
      unreadCount: 0,
      channel: 'whatsapp',
      assignedTo: { name: 'Carlos Lima', email: 'carlos@chatbot.com' },
      createdAt: new Date('2025-09-02T09:30:00Z'),
      updatedAt: new Date('2025-09-03T14:15:00Z'),
      tags: ['agradecimento'],
      category: 'Geral'
    },
    {
      id: '3',
      customerName: 'Pedro Oliveira',
      customerPhone: '+5511777777777',
      customerAvatar: null,
      lastMessage: 'Quando será entregue meu produto?',
      lastMessageAt: new Date('2025-09-03T13:45:00Z'),
      status: 'active',
      priority: 'medium',
      unreadCount: 1,
      channel: 'whatsapp',
      assignedTo: { name: 'Maria Santos', email: 'maria@chatbot.com' },
      createdAt: new Date('2025-09-03T11:20:00Z'),
      updatedAt: new Date('2025-09-03T13:45:00Z'),
      tags: ['entrega', 'produto'],
      category: 'Logística'
    },
    {
      id: '4',
      customerName: 'Carla Mendes',
      customerPhone: '+5511666666666',
      customerAvatar: null,
      lastMessage: 'Preciso cancelar minha compra',
      lastMessageAt: new Date('2025-09-03T12:30:00Z'),
      status: 'pending',
      priority: 'high',
      unreadCount: 3,
      channel: 'whatsapp',
      assignedTo: null,
      createdAt: new Date('2025-09-03T12:30:00Z'),
      updatedAt: new Date('2025-09-03T12:30:00Z'),
      tags: ['cancelamento'],
      category: 'Vendas'
    },
    {
      id: '5',
      customerName: 'Roberto Santos',
      customerPhone: '+5511555555555',
      customerAvatar: null,
      lastMessage: 'Produto chegou com defeito',
      lastMessageAt: new Date('2025-09-03T11:15:00Z'),
      status: 'active',
      priority: 'high',
      unreadCount: 1,
      channel: 'whatsapp',
      assignedTo: { name: 'Carlos Lima', email: 'carlos@chatbot.com' },
      createdAt: new Date('2025-09-03T10:45:00Z'),
      updatedAt: new Date('2025-09-03T11:15:00Z'),
      tags: ['defeito', 'produto'],
      category: 'Suporte Técnico'
    }
  ];

  async getConversations(companyId: string) {
    // Simular busca de conversas
    return {
      data: this.mockConversations,
      total: this.mockConversations.length,
      page: 1,
      limit: 50
    };
  }

  async getConversation(id: string, companyId: string) {
    // Simular busca de conversa específica
    const conversation = this.mockConversations.find(conv => conv.id === id);
    if (!conversation) {
      throw new Error('Conversa não encontrada');
    }
    return conversation;
  }

  async getMessages(conversationId: string, companyId: string) {
    // Simular busca de mensagens de uma conversa
    const mockMessages = [
      {
        id: '1',
        conversationId: conversationId,
        content: 'Olá! Preciso de ajuda com meu pedido #12345',
        type: 'text',
        direction: 'inbound',
        sender: { name: 'João Silva', phone: '+5511999999999' },
        createdAt: new Date('2025-09-01T10:00:00Z'),
        status: 'delivered'
      },
      {
        id: '2',
        conversationId: conversationId,
        content: 'Olá! Claro, vou te ajudar. Pode me dar mais detalhes sobre o problema?',
        type: 'text',
        direction: 'outbound',
        sender: { name: 'Maria Santos', email: 'maria@chatbot.com' },
        createdAt: new Date('2025-09-01T10:05:00Z'),
        status: 'delivered'
      },
      {
        id: '3',
        conversationId: conversationId,
        content: 'O pedido foi confirmado mas não recebi confirmação por email',
        type: 'text',
        direction: 'inbound',
        sender: { name: 'João Silva', phone: '+5511999999999' },
        createdAt: new Date('2025-09-01T10:10:00Z'),
        status: 'delivered'
      }
    ];

    return {
      data: mockMessages,
      total: mockMessages.length,
      page: 1,
      limit: 50
    };
  }

  async sendMessage(conversationId: string, messageData: any, companyId: string) {
    // Simular envio de mensagem
    const newMessage = {
      id: Date.now().toString(),
      conversationId: conversationId,
      ...messageData,
      direction: 'outbound',
      createdAt: new Date(),
      status: 'sent'
    };

    // Atualizar última mensagem da conversa
    const conversationIndex = this.mockConversations.findIndex(conv => conv.id === conversationId);
    if (conversationIndex !== -1 && this.mockConversations[conversationIndex]) {
      this.mockConversations[conversationIndex].lastMessage = messageData.content;
      this.mockConversations[conversationIndex].lastMessageAt = new Date();
    }

    return newMessage;
  }

  async updateConversationStatus(id: string, status: string, companyId: string) {
    // Simular atualização de status da conversa
    const conversationIndex = this.mockConversations.findIndex(conv => conv.id === id);
    if (conversationIndex === -1) {
      throw new Error('Conversa não encontrada');
    }

    if (this.mockConversations[conversationIndex]) {
      this.mockConversations[conversationIndex].status = status;
      this.mockConversations[conversationIndex].updatedAt = new Date();
      return this.mockConversations[conversationIndex];
    }
    
    throw new Error('Conversa não encontrada');
  }

  async assignConversation(id: string, assignedTo: any, companyId: string) {
    // Simular atribuição de conversa
    const conversationIndex = this.mockConversations.findIndex(conv => conv.id === id);
    if (conversationIndex === -1) {
      throw new Error('Conversa não encontrada');
    }

    if (this.mockConversations[conversationIndex]) {
      this.mockConversations[conversationIndex].assignedTo = assignedTo;
      this.mockConversations[conversationIndex].updatedAt = new Date();
      return this.mockConversations[conversationIndex];
    }
    
    throw new Error('Conversa não encontrada');
  }
}
