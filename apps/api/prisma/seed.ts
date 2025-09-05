import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar Company Demo
  const company = await prisma.company.upsert({
    where: { id: 'demo-company' },
    update: {},
    create: {
      id: 'demo-company',
      name: 'Demo',
    },
  });
  console.log('✅ Company criada:', company.name);

  const passwordHash = await argon2.hash('123456');

  // Criar usuário ADMIN
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Administrador Demo',
      passwordHash,
      role: 'ADMIN',
      companyId: company.id,
    },
  });
  console.log('✅ Usuário ADMIN criado:', adminUser.email);

  // Criar usuário AGENT
  const agentUser = await prisma.user.upsert({
    where: { email: 'agente@test.com' },
    update: {},
    create: {
      email: 'agente@test.com',
      name: 'Agente Demo',
      passwordHash,
      role: 'AGENT',
      companyId: company.id,
    },
  });
  console.log('✅ Usuário AGENT criado:', agentUser.email);

  // Criar usuário VIEWER
  const viewerUser = await prisma.user.upsert({
    where: { email: 'viewer@test.com' },
    update: {},
    create: {
      email: 'viewer@test.com',
      name: 'Visualizador Demo',
      passwordHash,
      role: 'VIEWER',
      companyId: company.id,
    },
  });
  console.log('✅ Usuário VIEWER criado:', viewerUser.email);

  // Criar Company B
  const companyB = await prisma.company.upsert({
    where: { id: 'company-b' },
    update: {},
    create: {
      id: 'company-b',
      name: 'Company B',
    },
  });
  console.log('✅ Company B criada:', companyB.name);

  // Criar usuário para Company B
  const userB = await prisma.user.upsert({
    where: { email: 'userb@companyb.com' },
    update: {},
    create: {
      email: 'userb@companyb.com',
      name: 'Usuário Company B',
      passwordHash,
      role: 'AGENT',
      companyId: companyB.id,
    },
  });
  console.log('✅ Usuário Company B criado:', userB.email);

  // Criar contatos para Demo
  const contact1 = await prisma.contact.upsert({
    where: { id: 'contact-1' },
    update: {},
    create: {
      id: 'contact-1',
      name: 'João Silva',
      phone: '+5511999999999',
      companyId: company.id,
    },
  });

  const contact2 = await prisma.contact.upsert({
    where: { id: 'contact-2' },
    update: {},
    create: {
      id: 'contact-2',
      name: 'Maria Santos',
      phone: '+5511888888888',
      companyId: company.id,
    },
  });

  const contact3 = await prisma.contact.upsert({
    where: { id: 'contact-3' },
    update: {},
    create: {
      id: 'contact-3',
      name: 'Pedro Costa',
      phone: '+5511777777777',
      companyId: company.id,
    },
  });

  console.log('✅ Contatos criados');

  // Criar tickets para Demo
  const ticket1 = await prisma.ticket.upsert({
    where: { id: 'ticket-1' },
    update: {},
    create: {
      id: 'ticket-1',
      contactId: contact1.id,
      status: 'open',
      priority: 'high',
      assignedUserId: agentUser.id,
      companyId: company.id,
      lastMessageAt: new Date(),
    },
  });

  const ticket2 = await prisma.ticket.upsert({
    where: { id: 'ticket-2' },
    update: {},
    create: {
      id: 'ticket-2',
      contactId: contact2.id,
      status: 'pending',
      priority: 'medium',
      companyId: company.id,
      lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
    },
  });

  const ticket3 = await prisma.ticket.upsert({
    where: { id: 'ticket-3' },
    update: {},
    create: {
      id: 'ticket-3',
      contactId: contact3.id,
      status: 'closed',
      priority: 'low',
      assignedUserId: adminUser.id,
      companyId: company.id,
      lastMessageAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    },
  });

  console.log('✅ Tickets criados');

  // Criar canais WhatsApp para Demo
  const whatsappChannel1 = await prisma.channel.upsert({
    where: { id: 'channel-whatsapp-1' },
    update: {},
    create: {
      id: 'channel-whatsapp-1',
      name: 'WhatsApp Principal',
      type: 'whatsapp_baileys',
      status: 'connected',
      externalId: '+5511999999999',
      companyId: company.id,
      config: {
        sessionId: 'whatsapp-session-1',
        qrCode: null,
        isConnected: true,
        lastSeen: new Date(),
        phoneNumber: '+5511999999999',
        businessName: 'Demo Company',
      },
    },
  });

  const whatsappChannel2 = await prisma.channel.upsert({
    where: { id: 'channel-whatsapp-2' },
    update: {},
    create: {
      id: 'channel-whatsapp-2',
      name: 'WhatsApp Vendas',
      type: 'whatsapp_baileys',
      status: 'disconnected',
      externalId: '+5511888888888',
      companyId: company.id,
      config: {
        sessionId: 'whatsapp-session-2',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        isConnected: false,
        lastSeen: null,
        phoneNumber: '+5511888888888',
        businessName: 'Demo Vendas',
      },
    },
  });

  const telegramChannel = await prisma.channel.upsert({
    where: { id: 'channel-telegram-1' },
    update: {},
    create: {
      id: 'channel-telegram-1',
      name: 'Telegram Suporte',
      type: 'telegram',
      status: 'connected',
      externalId: '@demo_suporte',
      companyId: company.id,
      config: {
        botToken: 'mock-bot-token',
        webhookUrl: 'https://api.telegram.org/bot/mock-bot-token/setWebhook',
        isConnected: true,
        lastSeen: new Date(),
        phoneNumber: '@demo_suporte',
        businessName: 'Demo Telegram',
      },
    },
  });

  console.log('✅ Canais criados');

  // Criar mensagens para os tickets
  await prisma.message.createMany({
    data: [
      // Mensagens do ticket 1
      {
        ticketId: ticket1.id,
        senderId: null, // Cliente
        body: 'Olá! Preciso de ajuda com meu pedido.',
        type: 'text',
        direction: 'inbound',
        companyId: company.id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      },
      {
        ticketId: ticket1.id,
        senderId: agentUser.id,
        body: 'Olá João! Claro, posso ajudar. Qual é o número do seu pedido?',
        type: 'text',
        direction: 'outbound',
        companyId: company.id,
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 horas atrás
      },
      {
        ticketId: ticket1.id,
        senderId: null, // Cliente
        body: 'O número é #12345. Está com status "em processamento" há 3 dias.',
        type: 'text',
        direction: 'inbound',
        companyId: company.id,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
      },

      // Mensagens do ticket 2
      {
        ticketId: ticket2.id,
        senderId: null, // Cliente
        body: 'Bom dia! Gostaria de saber sobre a política de devolução.',
        type: 'text',
        direction: 'inbound',
        companyId: company.id,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      },

      // Mensagens do ticket 3
      {
        ticketId: ticket3.id,
        senderId: null, // Cliente
        body: 'Obrigado pela ajuda! O problema foi resolvido.',
        type: 'text',
        direction: 'inbound',
        companyId: company.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      },
      {
        ticketId: ticket3.id,
        senderId: adminUser.id,
        body: 'Que ótimo! Fico feliz que conseguimos resolver. Se precisar de mais alguma coisa, é só chamar!',
        type: 'text',
        direction: 'outbound',
        companyId: company.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 2 dias atrás + 30 min
      },
    ],
  });

  console.log('✅ Mensagens criadas');

  // Criar canais para Demo
  const channel1 = await prisma.channel.upsert({
    where: { id: 'channel-1' },
    update: {},
    create: {
      id: 'channel-1',
      name: 'WhatsApp Principal',
      type: 'whatsapp-cloud',
      status: 'connected',
      externalId: '123456789',
      config: {
        accessToken: 'demo-token',
        phoneNumberId: '123456789',
      },
      companyId: company.id,
    },
  });

  console.log('✅ Canais criados');

  // Criar campanhas de exemplo
  const campaign1 = await prisma.campaign.upsert({
    where: { id: 'campaign-1' },
    update: {},
    create: {
      id: 'campaign-1',
      name: 'Promoção Black Friday',
      description: 'Campanha promocional para Black Friday com ofertas especiais',
      type: 'broadcast',
      message: '🎉 Black Friday chegou! Aproveite nossas ofertas especiais com até 50% de desconto! 🎉',
      channelId: channel1.id,
      status: 'draft',
      totalTargets: 0,
      sentCount: 0,
      failedCount: 0,
      optOutCount: 0,
      createdBy: adminUser.id,
      companyId: company.id,
    },
  });

  const campaign2 = await prisma.campaign.upsert({
    where: { id: 'campaign-2' },
    update: {},
    create: {
      id: 'campaign-2',
      name: 'Boas-vindas Novos Clientes',
      description: 'Campanha de boas-vindas para novos clientes cadastrados',
      type: 'segmented',
      message: '👋 Bem-vindo à nossa empresa! Estamos felizes em tê-lo como cliente. Como podemos ajudar?',
      channelId: channel1.id,
      status: 'completed',
      totalTargets: 2,
      sentCount: 2,
      failedCount: 0,
      optOutCount: 0,
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 dias atrás
      createdBy: adminUser.id,
      companyId: company.id,
    },
  });

  const campaign3 = await prisma.campaign.upsert({
    where: { id: 'campaign-3' },
    update: {},
    create: {
      id: 'campaign-3',
      name: 'Lembrete de Pagamento',
      description: 'Campanha para lembrar clientes sobre pagamentos pendentes',
      type: 'scheduled',
      message: '💳 Olá! Temos um pagamento pendente em sua conta. Acesse para regularizar sua situação.',
      channelId: channel1.id,
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
      totalTargets: 0,
      sentCount: 0,
      failedCount: 0,
      optOutCount: 0,
      createdBy: adminUser.id,
      companyId: company.id,
    },
  });

  console.log('✅ Campanhas criadas');

  // Criar alvos para as campanhas
  await prisma.campaignTarget.createMany({
    data: [
      // Alvos para campanha 1 (draft)
      {
        campaignId: campaign1.id,
        contactId: contact1.id,
        status: 'pending',
        attempts: 0,
        companyId: company.id,
      },
      {
        campaignId: campaign1.id,
        contactId: contact2.id,
        status: 'pending',
        attempts: 0,
        companyId: company.id,
      },
      {
        campaignId: campaign1.id,
        contactId: contact3.id,
        status: 'pending',
        attempts: 0,
        companyId: company.id,
      },

      // Alvos para campanha 2 (completed)
      {
        campaignId: campaign2.id,
        contactId: contact1.id,
        status: 'sent',
        attempts: 1,
        providerMessageId: 'msg_123456',
        lastAttemptAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        companyId: company.id,
      },
      {
        campaignId: campaign2.id,
        contactId: contact2.id,
        status: 'sent',
        attempts: 1,
        providerMessageId: 'msg_123457',
        lastAttemptAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        companyId: company.id,
      },

      // Alvos para campanha 3 (scheduled)
      {
        campaignId: campaign3.id,
        contactId: contact1.id,
        status: 'pending',
        attempts: 0,
        companyId: company.id,
      },
    ],
  });

  console.log('✅ Alvos de campanhas criados');

  // Criar execuções de campanhas
  await prisma.campaignRun.createMany({
    data: [
      {
        campaignId: campaign2.id,
        companyId: company.id,
        status: 'completed',
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        totalTargets: 2,
        processedCount: 2,
        successCount: 2,
        failureCount: 0,
      },
    ],
  });

  console.log('✅ Execuções de campanhas criadas');

  // Criar opt-outs de exemplo
  await prisma.optOut.createMany({
    data: [
      {
        contactId: contact3.id,
        channelId: channel1.id,
        reason: 'Não quero receber mais mensagens promocionais',
        source: 'manual',
        companyId: company.id,
      },
    ],
  });

  console.log('✅ Opt-outs criados');

  // Criar logs de eventos
  await prisma.eventLog.createMany({
    data: [
      {
        companyId: company.id,
        type: 'campaign_sent',
        entityType: 'campaign',
        entityId: campaign2.id,
        data: {
          contactPhone: contact1.phone,
          messageId: 'msg_123456',
        },
        metadata: {
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          provider: 'whatsapp_cloud',
        },
      },
      {
        companyId: company.id,
        type: 'opt_out',
        entityType: 'contact',
        entityId: contact3.id,
        data: {
          reason: 'Não quero receber mais mensagens promocionais',
          channelId: channel1.id,
        },
        metadata: {
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          source: 'manual',
        },
      },
    ],
  });

  console.log('✅ Logs de eventos criados');

  // Criar Business Hours para Demo
  await prisma.businessHours.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      timezone: 'America/Sao_Paulo',
      weeklyJson: {
        mon: { start: '08:00', end: '18:00' },
        tue: { start: '08:00', end: '18:00' },
        wed: { start: '08:00', end: '18:00' },
        thu: { start: '08:00', end: '18:00' },
        fri: { start: '08:00', end: '18:00' },
        sat: null,
        sun: null,
      },
    },
  });

  console.log('✅ Business Hours criados');

  // Criar SLA Policy para Demo
  await prisma.slaPolicy.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      firstResponseMins: 15,
      resolutionMins: 480,
    },
  });

  console.log('✅ SLA Policy criada');

  // Criar TicketSla para tickets existentes
  const tickets = await prisma.ticket.findMany({
    where: { companyId: company.id },
    select: { id: true },
  });

  for (const ticket of tickets) {
    await prisma.ticketSla.upsert({
      where: { ticketId: ticket.id },
      update: {},
      create: {
        ticketId: ticket.id,
        companyId: company.id,
        firstResponseDueAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
        resolutionDueAt: new Date(Date.now() + 480 * 60 * 1000), // 8 horas
        breachedFirstResp: false,
        breachedResolution: false,
      },
    });
  }

  console.log('✅ TicketSla criados');

  // Criar automações de exemplo
  const automation1 = await prisma.automation.upsert({
    where: { id: 'automation-1' },
    update: {},
    create: {
      id: 'automation-1',
      companyId: company.id,
      name: 'Boas-vindas',
      enabled: true,
      createdBy: adminUser.id,
      dsl: {
        triggers: [
          { type: 'inbound.message' },
        ],
        conditions: [
          { if: { firstContact: true } },
        ],
        actions: [
          {
            type: 'send.autoReply',
            template: 'Olá! Bem-vindo ao nosso atendimento. Em que posso ajudar?',
          },
          {
            type: 'add.tag',
            tag: 'novo_cliente',
          },
        ],
      },
    },
  });

  const automation2 = await prisma.automation.upsert({
    where: { id: 'automation-2' },
    update: {},
    create: {
      id: 'automation-2',
      companyId: company.id,
      name: 'Fora do horário',
      enabled: true,
      createdBy: adminUser.id,
      dsl: {
        triggers: [
          { type: 'inbound.message' },
        ],
        conditions: [
          { if: { outsideBusinessHours: true } },
        ],
        actions: [
          {
            type: 'send.autoReply',
            template: 'Olá! Estamos fora do horário de atendimento. Retornaremos em breve.',
          },
          {
            type: 'ticket.setStatus',
            status: 'pending',
          },
        ],
      },
    },
  });

  const automation3 = await prisma.automation.upsert({
    where: { id: 'automation-3' },
    update: {},
    create: {
      id: 'automation-3',
      companyId: company.id,
      name: 'Palavra-chave Venda',
      enabled: true,
      createdBy: adminUser.id,
      dsl: {
        triggers: [
          { type: 'inbound.message' },
        ],
        conditions: [
          { if: { keywordAny: ['venda', 'comprar', 'preço', 'valor'] } },
        ],
        actions: [
          {
            type: 'add.tag',
            tag: 'lead',
          },
          {
            type: 'assign.agent',
            strategy: 'round_robin',
          },
          {
            type: 'ticket.setStatus',
            status: 'pending',
          },
        ],
      },
    },
  });

  console.log('✅ Automações criadas');

  // Criar execuções de automações de exemplo
  await prisma.automationRun.createMany({
    data: [
      {
        id: 'run-auto-1',
        automationId: automation1.id,
        companyId: company.id,
        ticketId: ticket1.id,
        contactId: contact1.id,
        status: 'completed',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        finishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
        context: {
          eventId: 'event-auto-1',
          eventType: 'inbound.message',
          actionsExecuted: 2,
          triggered: true,
          conditionsMet: true,
        },
      },
    ],
  });

  console.log('✅ Execuções de automações criadas');

  // Criar métricas diárias de exemplo
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  await prisma.metricDaily.createMany({
    data: [
      {
        companyId: company.id,
        date: yesterday,
        scope: 'chat',
        key: 'total',
        metric: 'messages',
        value: 15,
      },
      {
        companyId: company.id,
        date: yesterday,
        scope: 'chat',
        key: 'total',
        metric: 'messages_inbound',
        value: 8,
      },
      {
        companyId: company.id,
        date: yesterday,
        scope: 'chat',
        key: 'total',
        metric: 'messages_outbound',
        value: 7,
      },
      {
        companyId: company.id,
        date: yesterday,
        scope: 'campaign',
        key: 'total',
        metric: 'campaign_runs',
        value: 2,
      },
      {
        companyId: company.id,
        date: yesterday,
        scope: 'sla',
        key: 'total',
        metric: 'sla_breaches',
        value: 1,
      },
      {
        companyId: company.id,
        date: yesterday,
        scope: 'channel',
        key: channel1.id,
        metric: 'messages_sent',
        value: 7,
      },
      {
        companyId: company.id,
        date: yesterday,
        scope: 'agent',
        key: adminUser.id,
        metric: 'tickets_handled',
        value: 3,
      },
    ],
  });

  console.log('✅ Métricas diárias criadas');

  // Criar logs de auditoria de exemplo
  await prisma.auditLog.createMany({
    data: [
      {
        companyId: company.id,
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'LOGIN',
        targetType: 'auth',
        success: true,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        meta: {
          method: 'POST',
          url: '/api/v1/auth/login',
          duration: 150,
        },
      },
      {
        companyId: company.id,
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'CREATE',
        targetType: 'ticket',
        targetId: ticket1.id,
        success: true,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        meta: {
          method: 'POST',
          url: '/api/v1/tickets',
          duration: 200,
          ticketStatus: 'open',
        },
      },
      {
        companyId: company.id,
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'SEND_MESSAGE',
        targetType: 'message',
        targetId: 'msg-1-2',
        success: true,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        meta: {
          method: 'POST',
          url: '/api/v1/messages',
          duration: 180,
          messageType: 'text',
          direction: 'outbound',
        },
      },
      {
        companyId: company.id,
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'START_CAMPAIGN',
        targetType: 'campaign',
        targetId: campaign2.id,
        success: true,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        meta: {
          method: 'POST',
          url: '/api/v1/campaigns/campaign-2/start',
          duration: 500,
          campaignType: 'segmented',
          totalTargets: 2,
        },
      },
      {
        companyId: company.id,
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        action: 'CHANGE_SETTINGS',
        targetType: 'settings',
        success: true,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        meta: {
          method: 'PUT',
          url: '/api/v1/settings/sla',
          duration: 120,
          firstResponseMins: 15,
          resolutionMins: 480,
        },
      },
    ],
  });

  console.log('✅ Logs de auditoria criados');

  // Criar Planos
  const freePlan = await prisma.plan.upsert({
    where: { tier: 'FREE' },
    update: {},
    create: {
      tier: 'FREE',
      name: 'Gratuito',
      description: 'Plano gratuito com recursos limitados',
      maxUsers: 3,
      maxChannels: 1,
      maxMessagesMonthly: 5000,
      maxCampaignsDaily: 2,
      retentionDays: 30,
      features: {
        automations: false,
        campaigns: true,
        reports: 'basic',
      },
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { tier: 'PRO' },
    update: {},
    create: {
      tier: 'PRO',
      name: 'Profissional',
      description: 'Plano profissional com recursos avançados',
      maxUsers: 10,
      maxChannels: 3,
      maxMessagesMonthly: 50000,
      maxCampaignsDaily: 10,
      retentionDays: 90,
      features: {
        automations: true,
        campaigns: true,
        reports: 'advanced',
      },
    },
  });

  const businessPlan = await prisma.plan.upsert({
    where: { tier: 'BUSINESS' },
    update: {},
    create: {
      tier: 'BUSINESS',
      name: 'Empresarial',
      description: 'Plano empresarial com recursos ilimitados',
      maxUsers: 100,
      maxChannels: 10,
      maxMessagesMonthly: 500000,
      maxCampaignsDaily: 100,
      retentionDays: 365,
      features: {
        automations: true,
        campaigns: true,
        reports: 'advanced',
        priority_support: true,
      },
    },
  });

  console.log('✅ Planos criados:', [freePlan.name, proPlan.name, businessPlan.name]);

  // Criar assinaturas FREE para todas as empresas
  const companies = await prisma.company.findMany();
  const anchorDay = parseInt(process.env.BILLING_ANCHOR_DAY || '1');
  const now = new Date();
  const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), anchorDay);
  const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, anchorDay);

  for (const company of companies) {
    await prisma.subscription.upsert({
      where: { companyId: company.id },
      update: {},
      create: {
        companyId: company.id,
        planId: freePlan.id,
        provider: 'mock',
        status: 'active',
        currentPeriodStart,
        currentPeriodEnd,
        anchorDay,
      },
    });
  }

  console.log(`✅ Assinaturas FREE criadas para ${companies.length} empresas`);

  // Criar plugins de exemplo
  const slackPlugin = await prisma.plugin.upsert({
    where: { slug: 'slack-notifier' },
    update: {},
    create: {
      slug: 'slack-notifier',
      name: 'Slack Notifier',
      publisher: 'Atendechat',
      kind: 'webhook_only',
      description: 'Notifica o Slack quando novos tickets são criados ou mensagens importantes chegam',
      website: 'https://slack.com',
      appUrl: 'https://docs.atendechat.com/plugins/slack-notifier',
      features: {
        notifications: true,
        channels: ['general', 'support', 'alerts'],
        templates: ['ticket_created', 'urgent_message', 'sla_breach'],
      },
      requiredScopes: ['read_tickets', 'read_messages'],
    },
  });

  const zapierPlugin = await prisma.plugin.upsert({
    where: { slug: 'zapier-catch-hook' },
    update: {},
    create: {
      slug: 'zapier-catch-hook',
      name: 'Zapier Catch Hook',
      publisher: 'Zapier',
      kind: 'webhook_only',
      description: 'Integra com Zapier para automatizar fluxos de trabalho com outros serviços',
      website: 'https://zapier.com',
      appUrl: 'https://zapier.com/apps/atendechat',
      features: {
        triggers: ['ticket_created', 'message_received', 'campaign_completed'],
        actions: ['create_contact', 'update_crm', 'send_notification'],
        webhooks: true,
      },
      requiredScopes: ['read_tickets', 'read_messages', 'read_contacts', 'read_campaigns'],
    },
  });

  const webhookGenericPlugin = await prisma.plugin.upsert({
    where: { slug: 'webhook-generic' },
    update: {},
    create: {
      slug: 'webhook-generic',
      name: 'Webhook Genérico',
      publisher: 'Atendechat',
      kind: 'webhook_only',
      description: 'Plugin genérico para enviar eventos para qualquer endpoint webhook personalizado',
      website: 'https://docs.atendechat.com/webhooks',
      appUrl: 'https://docs.atendechat.com/plugins/webhook-generic',
      features: {
        custom_events: true,
        payload_customization: true,
        retry_logic: true,
        signature_verification: true,
      },
      requiredScopes: ['read_tickets', 'read_messages', 'read_contacts'],
    },
  });

  // Criar versões para os plugins
  const slackVersion = await prisma.pluginVersion.upsert({
    where: { id: 'slack-notifier-v1' },
    update: {},
    create: {
      id: 'slack-notifier-v1',
      pluginId: slackPlugin.id,
      version: '1.0.0',
      manifest: {
        events: ['ticket.created', 'ticket.updated', 'message.created'],
        endpoints: {
          webhook: 'POST /webhook',
          config: 'GET /config',
        },
        instructions: 'Configure o webhook do Slack e selecione os canais para receber notificações',
      },
      changelog: 'Versão inicial com suporte a notificações básicas',
    },
  });

  const zapierVersion = await prisma.pluginVersion.upsert({
    where: { id: 'zapier-catch-hook-v1' },
    update: {},
    create: {
      id: 'zapier-catch-hook-v1',
      pluginId: zapierPlugin.id,
      version: '1.0.0',
      manifest: {
        events: ['ticket.*', 'message.*', 'campaign.*'],
        endpoints: {
          webhook: 'POST /webhook',
          auth: 'GET /auth',
        },
        instructions: 'Use o Zapier para conectar com mais de 5000+ aplicações',
      },
      changelog: 'Integração inicial com Zapier',
    },
  });

  const webhookVersion = await prisma.pluginVersion.upsert({
    where: { id: 'webhook-generic-v1' },
    update: {},
    create: {
      id: 'webhook-generic-v1',
      pluginId: webhookGenericPlugin.id,
      version: '1.0.0',
      manifest: {
        events: ['*'],
        endpoints: {
          webhook: 'POST /webhook',
        },
        instructions: 'Configure a URL do webhook e selecione os eventos que deseja receber',
      },
      changelog: 'Plugin genérico para webhooks personalizados',
    },
  });

  console.log('✅ Plugins criados:', [slackPlugin.name, zapierPlugin.name, webhookGenericPlugin.name]);

  // Criar Base de Conhecimento padrão para Demo
  const defaultKB = await prisma.knowledgeBase.upsert({
    where: { id: 'demo-kb-default' },
    update: {},
    create: {
      id: 'demo-kb-default',
      name: 'Base de Conhecimento Padrão',
      description: 'FAQ e informações básicas da empresa',
      isDefault: true,
      companyId: company.id,
    },
  });
  console.log('✅ Base de Conhecimento criada:', defaultKB.name);

  // Criar artigos de exemplo
  const articles = [
    {
      title: 'Como funciona o atendimento?',
      contentMd: `# Como funciona o atendimento?

Nosso sistema de atendimento funciona através de tickets organizados por conversa.

## Processo:
1. **Cliente envia mensagem** → Cria ticket automaticamente
2. **Agente recebe notificação** → Atende no chat
3. **Conversa continua** → Histórico mantido
4. **Ticket é fechado** → Quando resolvido

## Canais suportados:
- WhatsApp (Cloud API)
- WhatsApp (Baileys)
- Web Chat (em breve)

## Horário de funcionamento:
- Segunda a Sexta: 8h às 18h
- Sábado: 9h às 12h`,
      lang: 'pt-BR',
      tags: ['atendimento', 'processo', 'horários'],
      status: 'published',
    },
    {
      title: 'Política de Trocas e Devoluções',
      contentMd: `# Política de Trocas e Devoluções

## Prazo para troca:
- **30 dias** após a compra
- Produto deve estar em perfeito estado
- Embalagem original preservada

## Como solicitar:
1. Entre em contato via WhatsApp
2. Informe o número do pedido
3. Descreva o motivo da troca
4. Anexe fotos se necessário

## Produtos não aceitos:
- Produtos personalizados
- Produtos de higiene pessoal
- Produtos em promoção (final)

## Processo de troca:
1. **Aprovação** → 24h úteis
2. **Coleta** → 2-3 dias úteis
3. **Troca** → 5-7 dias úteis`,
      lang: 'pt-BR',
      tags: ['trocas', 'devoluções', 'política'],
      status: 'published',
    },
    {
      title: 'Horários de Atendimento',
      contentMd: `# Horários de Atendimento

## Atendimento Humano:
- **Segunda a Sexta**: 8h às 18h
- **Sábado**: 9h às 12h
- **Domingo**: Fechado

## Feriados:
- Atendimento reduzido ou fechado
- Consulte nosso calendário

## Resposta Automática:
- **24h por dia** para mensagens básicas
- **FAQ automático** disponível sempre
- **Tickets criados** mesmo fora do horário

## Emergências:
- **WhatsApp**: Resposta em até 2h
- **Urgente**: Marque como prioridade alta`,
      lang: 'pt-BR',
      tags: ['horários', 'feriados', 'emergências'],
      status: 'published',
    },
    {
      title: 'FAQ - Perguntas Frequentes',
      contentMd: `# FAQ - Perguntas Frequentes

## Produtos:
**Q: Vocês fazem entrega?**
R: Sim, entregamos em toda a região metropolitana.

**Q: Qual o prazo de entrega?**
R: 1-3 dias úteis para região metropolitana.

**Q: Aceitam cartão de crédito?**
R: Sim, aceitamos todas as bandeiras principais.

## Atendimento:
**Q: Posso falar com um atendente?**
R: Sim, nossos agentes estão disponíveis nos horários comerciais.

**Q: Como faço uma reclamação?**
R: Entre em contato via WhatsApp ou e-mail.

**Q: Vocês têm loja física?**
R: Não, somos 100% online.`,
      lang: 'pt-BR',
      tags: ['faq', 'produtos', 'atendimento'],
      status: 'published',
    },
    {
      title: 'Problemas Técnicos',
      contentMd: `# Problemas Técnicos

## Problemas comuns:

### **App não abre:**
1. Reinicie o aplicativo
2. Verifique se há atualizações
3. Limpe o cache do app
4. Reinstale se necessário

### **Mensagens não chegam:**
1. Verifique a conexão com internet
2. Confirme se o número está correto
3. Verifique se não está bloqueado
4. Teste com outro dispositivo

### **Erro de pagamento:**
1. Verifique os dados do cartão
2. Confirme o limite disponível
3. Tente outro método de pagamento
4. Entre em contato com o banco

## Suporte técnico:
- **WhatsApp**: Resposta em até 1h
- **E-mail**: suporte@empresa.com
- **Telefone**: (11) 9999-9999`,
      lang: 'pt-BR',
      tags: ['problemas', 'técnico', 'suporte'],
      status: 'published',
    },
  ];

  for (const articleData of articles) {
    await prisma.kBArticle.upsert({
      where: { id: `demo-article-${articleData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}` },
      update: {},
      create: {
        id: `demo-article-${articleData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        ...articleData,
        kbId: defaultKB.id,
      },
    });
  }
  console.log('✅ Artigos de exemplo criados:', articles.length);

  // Criar eventos de consentimento para Demo
  const consentEvents = [
    {
      kind: 'TERMS' as const,
      accepted: true,
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      kind: 'PRIVACY' as const,
      accepted: true,
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      kind: 'COOKIES' as const,
      accepted: true,
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  ];

  for (const consentData of consentEvents) {
    await prisma.consentEvent.upsert({
      where: { 
        id: `demo-consent-${consentData.kind.toLowerCase()}-${company.id}` 
      },
      update: {},
      create: {
        id: `demo-consent-${consentData.kind.toLowerCase()}-${company.id}`,
        companyId: company.id,
        userId: adminUser.id,
        ...consentData,
      },
    });
  }
  console.log('✅ Eventos de consentimento criados:', consentEvents.length);

  // Criar DSR requests de exemplo para Demo
  const dsrRequests = [
    {
      kind: 'EXPORT' as const,
      requesterEmail: 'usuario@exemplo.com',
      status: 'COMPLETED' as const,
      resultPath: '/storage/dsr/export-demo-1.zip',
      reason: 'Solicitação de dados pessoais',
    },
    {
      kind: 'DELETE' as const,
      requesterEmail: 'excluir@exemplo.com',
      status: 'IN_PROGRESS' as const,
      reason: 'Direito ao esquecimento',
    },
  ];

  for (const dsrData of dsrRequests) {
    await prisma.dsrRequest.upsert({
      where: { 
        id: `demo-dsr-${dsrData.kind.toLowerCase()}-${company.id}` 
      },
      update: {},
      create: {
        id: `demo-dsr-${dsrData.kind.toLowerCase()}-${company.id}`,
        companyId: company.id,
        ...dsrData,
      },
    });
  }
  console.log('✅ DSR requests de exemplo criados:', dsrRequests.length);

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
