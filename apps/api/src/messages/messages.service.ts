import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { EventsService } from '../webhooks/events.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  async create(
    createMessageDto: CreateMessageDto & { direction?: string },
    companyId: string,
  ) {
    // Verificar se o ticket existe e pertence à empresa
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id: createMessageDto.ticketId,
        companyId,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    const message = await this.prisma.message.create({
      data: {
        ...createMessageDto,
        ticketId: createMessageDto.ticketId,
        senderId: createMessageDto.senderId || null,
        companyId,
      },
      include: {
        sender: true,
        ticket: {
          include: {
            contact: true,
          },
        },
      },
    });

    // Atualizar lastMessageAt do ticket
    await this.prisma.ticket.update({
      where: { id: createMessageDto.ticketId },
      data: { lastMessageAt: new Date() },
    });

    // Publicar evento de webhook
    await this.eventsService.publishEvent({
      companyId,
      key: 'message.created',
      refType: 'message',
      refId: message.id,
      payload: {
        message: {
          id: message.id,
          body: message.body,
          direction: message.direction,
          ticketId: message.ticketId,
          senderId: message.senderId,
          createdAt: message.createdAt,
        },
        ticket: {
          id: message.ticket.id,
          status: message.ticket.status,
          contactId: message.ticket.contactId,
        },
        contact: {
          id: message.ticket.contact.id,
          name: message.ticket.contact.name,
          phone: message.ticket.contact.phone,
        },
      },
    });

    return message;
  }

  async findAll(ticketId: string, query: QueryMessagesDto, companyId: string) {
    // Verificar se o ticket existe e pertence à empresa
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        companyId,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    const { cursor, limit = 50 } = query;

    const where: any = {
      ticketId,
      companyId,
    };

    if (cursor) {
      where.id = { gt: cursor };
    }

    const messages = await this.prisma.message.findMany({
      where,
      take: limit + 1, // +1 para verificar se há mais páginas
      orderBy: { createdAt: 'asc' },
      include: {
        sender: true,
      },
    });

    const hasNextPage = messages.length > limit;
    const items = hasNextPage ? messages.slice(0, -1) : messages;
    const nextCursor = hasNextPage && items.length > 0 ? items[items.length - 1]?.id : null;

    return {
      items,
      nextCursor,
      hasNextPage,
    };
  }

  async findOne(id: string, companyId: string) {
    const message = await this.prisma.message.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        sender: true,
        ticket: {
          include: {
            contact: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    return message;
  }

  async remove(id: string, companyId: string) {
    // Verificar se a mensagem existe e pertence à empresa
    const existingMessage = await this.prisma.message.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingMessage) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    await this.prisma.message.delete({
      where: { id },
    });

    return { message: 'Mensagem removida com sucesso' };
  }
}
