import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(companyId: string) {
    // Dados mock para dashboard
    return {
      tickets: {
        total: 25,
        open: 8,
        inProgress: 12,
        resolved: 5,
        pending: 0
      },
      messages: {
        total: 156,
        today: 23,
        thisWeek: 89,
        thisMonth: 156
      },
      campaigns: {
        total: 7,
        active: 3,
        completed: 4,
        scheduled: 2
      },
      channels: {
        total: 3,
        active: 2,
        inactive: 1
      },
      performance: {
        responseTime: '2.3h',
        resolutionTime: '1.8 dias',
        satisfaction: 4.7
      }
    };
  }

  async getRecentActivity(companyId: string) {
    // Dados mock para atividade recente
    return [
      {
        id: '1',
        type: 'ticket_created',
        title: 'Novo ticket criado',
        description: 'João Silva criou um ticket sobre problemas no WhatsApp',
        timestamp: new Date('2025-09-03T17:30:00Z'),
        user: 'João Silva',
        priority: 'high'
      },
      {
        id: '2',
        type: 'message_received',
        title: 'Nova mensagem recebida',
        description: 'Ana Costa enviou uma mensagem no ticket #2',
        timestamp: new Date('2025-09-03T17:25:00Z'),
        user: 'Ana Costa',
        priority: 'medium'
      },
      {
        id: '3',
        type: 'ticket_resolved',
        title: 'Ticket resolvido',
        description: 'Ticket #3 foi marcado como resolvido por Lucia Mendes',
        timestamp: new Date('2025-09-03T17:20:00Z'),
        user: 'Lucia Mendes',
        priority: 'low'
      },
      {
        id: '4',
        type: 'campaign_started',
        title: 'Campanha iniciada',
        description: 'Campanha "Lançamento Produto" foi iniciada',
        timestamp: new Date('2025-09-03T17:15:00Z'),
        user: 'Sistema',
        priority: 'medium'
      },
      {
        id: '5',
        type: 'channel_connected',
        title: 'Canal conectado',
        description: 'WhatsApp Business foi conectado com sucesso',
        timestamp: new Date('2025-09-03T17:10:00Z'),
        user: 'Sistema',
        priority: 'low'
      }
    ];
  }
}
