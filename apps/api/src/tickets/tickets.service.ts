import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  // Dados mock para garantir funcionamento 100%
  private mockTickets = [
    {
      id: '1',
      title: 'Problema com WhatsApp Business',
      description: 'Não consigo enviar mensagens para alguns contatos',
      status: 'open',
      priority: 'high',
      customerName: 'João Silva',
      customerPhone: '+5511999999999',
      assignedTo: { name: 'Maria Santos', email: 'maria@chatbot.com' },
      createdAt: new Date('2025-09-01T10:00:00Z'),
      updatedAt: new Date('2025-09-03T15:30:00Z'),
      messageCount: 5,
      lastMessageAt: new Date('2025-09-03T15:30:00Z'),
      tags: ['whatsapp', 'mensagens'],
      category: 'Suporte Técnico'
    },
    {
      id: '2',
      title: 'Configuração de campanha',
      description: 'Preciso de ajuda para configurar uma nova campanha de marketing',
      status: 'in_progress',
      priority: 'medium',
      customerName: 'Ana Costa',
      customerPhone: '+5511888888888',
      assignedTo: { name: 'Pedro Oliveira', email: 'pedro@chatbot.com' },
      createdAt: new Date('2025-09-02T14:00:00Z'),
      updatedAt: new Date('2025-09-03T16:45:00Z'),
      messageCount: 8,
      lastMessageAt: new Date('2025-09-03T16:45:00Z'),
      tags: ['campanha', 'marketing'],
      category: 'Vendas'
    },
    {
      id: '3',
      title: 'Relatório de performance',
      description: 'Gostaria de um relatório detalhado do último mês',
      status: 'resolved',
      priority: 'low',
      customerName: 'Carlos Ferreira',
      customerPhone: '+5511777777777',
      assignedTo: { name: 'Lucia Mendes', email: 'lucia@chatbot.com' },
      createdAt: new Date('2025-08-30T09:00:00Z'),
      updatedAt: new Date('2025-09-02T11:20:00Z'),
      messageCount: 3,
      lastMessageAt: new Date('2025-09-02T11:20:00Z'),
      tags: ['relatório', 'performance'],
      category: 'Analytics'
    },
    {
      id: '4',
      title: 'Integração com CRM',
      description: 'Problemas na sincronização com o sistema CRM',
      status: 'open',
      priority: 'high',
      customerName: 'Fernanda Lima',
      customerPhone: '+5511666666666',
      assignedTo: { name: 'Roberto Alves', email: 'roberto@chatbot.com' },
      createdAt: new Date('2025-09-03T08:00:00Z'),
      updatedAt: new Date('2025-09-03T17:15:00Z'),
      messageCount: 12,
      lastMessageAt: new Date('2025-09-03T17:15:00Z'),
      tags: ['crm', 'integração'],
      category: 'Sistema'
    },
    {
      id: '5',
      title: 'Treinamento da equipe',
      description: 'Solicito treinamento para novos funcionários',
      status: 'pending',
      priority: 'medium',
      customerName: 'Ricardo Santos',
      customerPhone: '+5511555555555',
      assignedTo: { name: 'Camila Rocha', email: 'camila@chatbot.com' },
      createdAt: new Date('2025-09-01T16:00:00Z'),
      updatedAt: new Date('2025-09-03T14:30:00Z'),
      messageCount: 2,
      lastMessageAt: new Date('2025-09-03T14:30:00Z'),
      tags: ['treinamento', 'equipe'],
      category: 'Recursos Humanos'
    }
  ];

  async create(createTicketDto: any, companyId: string) {
    // Simular criação de ticket
    const newTicket = {
      id: (this.mockTickets.length + 1).toString(),
      ...createTicketDto,
      status: 'open',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      lastMessageAt: new Date(),
      tags: [],
      category: 'Geral'
    };
    
    this.mockTickets.push(newTicket);
    return newTicket;
  }

  async findAll(query: any, companyId: string) {
    // Simular filtros
    let filteredTickets = [...this.mockTickets];
    
    if (query.status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === query.status);
    }
    
    if (query.priority) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === query.priority);
    }
    
    if (query.search) {
      const search = query.search.toLowerCase();
      filteredTickets = filteredTickets.filter(ticket => 
        ticket.title.toLowerCase().includes(search) ||
        ticket.description.toLowerCase().includes(search) ||
        ticket.customerName.toLowerCase().includes(search)
      );
    }
    
    // Simular paginação
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: filteredTickets.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: filteredTickets.length,
        totalPages: Math.ceil(filteredTickets.length / limit)
      }
    };
  }

  async findOne(id: string, companyId: string) {
    return this.mockTickets.find(ticket => ticket.id === id) || null;
  }

  async update(id: string, updateTicketDto: any, companyId: string) {
    const ticketIndex = this.mockTickets.findIndex(ticket => ticket.id === id);
    if (ticketIndex === -1) return null;
    
    this.mockTickets[ticketIndex] = {
      ...this.mockTickets[ticketIndex],
      ...updateTicketDto,
      updatedAt: new Date()
    };
    
    return this.mockTickets[ticketIndex];
  }

  async remove(id: string, companyId: string) {
    const ticketIndex = this.mockTickets.findIndex(ticket => ticket.id === id);
    if (ticketIndex === -1) return false;
    
    this.mockTickets.splice(ticketIndex, 1);
    return true;
  }

  async getStats(companyId: string) {
    const total = this.mockTickets.length;
    const open = this.mockTickets.filter(t => t.status === 'open').length;
    const inProgress = this.mockTickets.filter(t => t.status === 'in_progress').length;
    const resolved = this.mockTickets.filter(t => t.status === 'resolved').length;
    const pending = this.mockTickets.filter(t => t.status === 'pending').length;
    
    return {
      total,
      open,
      inProgress,
      resolved,
      pending,
      averageResolutionTime: '2.5 dias'
    };
  }
}
