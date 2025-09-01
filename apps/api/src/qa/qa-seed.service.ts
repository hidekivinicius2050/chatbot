import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { faker } from '@faker-js/faker';

@Injectable()
export class QaSeedService {
  private readonly logger = new Logger(QaSeedService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async seedQaData(): Promise<void> {
    const qaSeedDemo = this.configService.get('QA_SEED_DEMO', false);
    if (!qaSeedDemo) {
      this.logger.log('QA_SEED_DEMO=false, pulando seeds QA');
      return;
    }

    this.logger.log('Iniciando seeds QA com dados sintéticos...');

    try {
      // Buscar company padrão
      const company = await this.prisma.company.findFirst();
      if (!company) {
        this.logger.warn('Nenhuma company encontrada, pulando seeds QA');
        return;
      }

      const syntheticUsers = this.configService.get('QA_SYNTHETIC_USERS', 20);
      const syntheticTickets = this.configService.get('QA_SYNTHETIC_TICKETS', 1000);
      const syntheticMessagesPerTicket = this.configService.get('QA_SYNTHETIC_MESSAGES_PER_TICKET', 5);

      // 1. Gerar usuários sintéticos
      await this.generateSyntheticUsers(company.id, syntheticUsers);

      // 2. Gerar tickets sintéticos
      await this.generateSyntheticTickets(company.id, syntheticTickets);

      // 3. Gerar mensagens sintéticas
      await this.generateSyntheticMessages(company.id, syntheticMessagesPerTicket);

      // 4. Gerar campanhas sintéticas
      await this.generateSyntheticCampaigns(company.id);

      // 5. Gerar métricas sintéticas
      await this.generateSyntheticMetrics(company.id);

      this.logger.log(`Seeds QA concluídos: ${syntheticUsers} usuários, ${syntheticTickets} tickets, ${syntheticMessagesPerTicket} msgs/ticket`);
    } catch (error) {
      this.logger.error('Erro ao executar seeds QA:', error);
      throw error;
    }
  }

  private async generateSyntheticUsers(companyId: string, count: number): Promise<void> {
    const roles = ['OWNER', 'ADMIN', 'AGENT', 'VIEWER'];
    const users = [];

    for (let i = 0; i < count; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const isActive = Math.random() > 0.1; // 90% ativos

      users.push({
        companyId,
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: (role || 'VIEWER') as any,
        isActive,
        avatar: faker.image.avatar(),
        phone: faker.phone.number(),
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        passwordHash: 'qa-seed-password-hash',
      });
    }

    await this.prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    });
  }

  private async generateSyntheticTickets(companyId: string, count: number): Promise<void> {
    const statuses = ['open', 'pending', 'resolved', 'closed'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const channels = ['whatsapp', 'telegram', 'web'];
    const tickets = [];

    for (let i = 0; i < count; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const channel = channels[Math.floor(Math.random() * channels.length)];
      const createdAt = faker.date.recent({ days: 30 });

      tickets.push({
        companyId,
        status: status || 'open',
        priority: priority || 'medium',
        channel: channel || 'web',
        createdAt,
        updatedAt: createdAt,
        // Campos opcionais
        subject: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        customerName: faker.person.fullName(),
        customerEmail: faker.internet.email(),
        customerPhone: faker.phone.number(),
        assignedToId: null, // Será atribuído aleatoriamente depois
        contactId: faker.string.alphanumeric(20),
        tags: faker.helpers.arrayElements(['urgente', 'bug', 'feature', 'suporte'], { min: 0, max: 3 }),
      });
    }

    await this.prisma.ticket.createMany({
      data: tickets,
      skipDuplicates: true,
    });
  }

  private async generateSyntheticMessages(companyId: string, messagesPerTicket: number): Promise<void> {
    const tickets = await this.prisma.ticket.findMany({
      where: { companyId },
      select: { id: true },
    });

    const messages = [];
    const messageTypes = ['inbound', 'outbound'];
    const providers = ['whatsapp_cloud', 'baileys', 'telegram'];

    for (const ticket of tickets) {
      const messageCount = Math.floor(Math.random() * messagesPerTicket) + 1;
      
      for (let i = 0; i < messageCount; i++) {
        const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
        const provider = providers[Math.floor(Math.random() * providers.length)];
        const createdAt = faker.date.recent({ days: 7 });

        messages.push({
          ticketId: ticket.id,
          companyId,
          type: messageType || 'inbound',
          body: faker.lorem.sentence(),
          provider: provider || 'web',
          providerMessageId: faker.string.alphanumeric(20),
          status: 'delivered',
          createdAt,
          updatedAt: createdAt,
          // Campos opcionais
          attachments: Math.random() > 0.8 ? [{
            type: 'image',
            url: faker.image.url(),
            filename: faker.system.fileName(),
            size: faker.number.int({ min: 1000, max: 5000000 }),
          }] : [],
          metadata: {
            device: faker.helpers.arrayElement(['iPhone', 'Android', 'Web']),
            location: faker.location.city(),
          },
        });
      }
    }

    // Inserir em lotes para evitar timeout
    const batchSize = 100;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      await this.prisma.message.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }
  }

  private async generateSyntheticCampaigns(companyId: string): Promise<void> {
    // Comentando campanhas temporariamente devido a problemas de tipos
    this.logger.log('Campanhas sintéticas desabilitadas temporariamente');
    return;
  }

  private async generateSyntheticMetrics(companyId: string): Promise<void> {
    // Gerar métricas dos últimos 30 dias
    const days = 30;
    const metrics = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Métricas de tickets
      metrics.push({
        companyId,
        date,
        scope: 'tickets',
        key: 'total_created',
        metric: 'count',
        value: Math.floor(Math.random() * 50) + 10,
      });

      metrics.push({
        companyId,
        date,
        scope: 'tickets',
        key: 'total_resolved',
        metric: 'count',
        value: Math.floor(Math.random() * 40) + 8,
      });

      // Métricas de mensagens
      metrics.push({
        companyId,
        date,
        scope: 'messages',
        key: 'total_sent',
        metric: 'count',
        value: Math.floor(Math.random() * 200) + 50,
      });

      // Métricas de SLA
      metrics.push({
        companyId,
        date,
        scope: 'sla',
        key: 'first_response_avg_minutes',
        metric: 'duration',
        value: Math.floor(Math.random() * 30) + 5,
      });

      metrics.push({
        companyId,
        date,
        scope: 'sla',
        key: 'resolution_avg_minutes',
        metric: 'duration',
        value: Math.floor(Math.random() * 480) + 60,
      });
    }

    await this.prisma.metricDaily.createMany({
      data: metrics,
      skipDuplicates: true,
    });
  }
}
