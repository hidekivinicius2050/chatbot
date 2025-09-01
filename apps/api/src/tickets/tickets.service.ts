import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { QueryTicketsDto } from './dto/query-tickets.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto, userId: string, companyId: string) {
    // Verificar se o contato existe e pertence à empresa
    const contact = await this.prisma.contact.findFirst({
      where: {
        id: createTicketDto.contactId,
        companyId,
      },
    });

    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        ...createTicketDto,
        companyId,
        status: 'open',
        lastMessageAt: new Date(),
      },
      include: {
        contact: true,
        assignedTo: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return ticket;
  }

  async findAll(query: QueryTicketsDto, companyId: string) {
    const { status, search, cursor, limit = 30 } = query;

    const where: any = { companyId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.contact = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (cursor) {
      where.id = { lt: cursor };
    }

    const tickets = await this.prisma.ticket.findMany({
      where,
      take: limit + 1, // +1 para verificar se há mais páginas
      orderBy: { lastMessageAt: 'desc' },
      include: {
        contact: true,
        assignedTo: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const hasNextPage = tickets.length > limit;
    const items = hasNextPage ? tickets.slice(0, -1) : tickets;
    const nextCursor = hasNextPage && items.length > 0 ? items[items.length - 1]?.id : null;

    return {
      items,
      nextCursor,
      hasNextPage,
    };
  }

  async findOne(id: string, companyId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        contact: true,
        assignedTo: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, companyId: string) {
    // Verificar se o ticket existe e pertence à empresa
    const existingTicket = await this.prisma.ticket.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingTicket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    // Se estiver atribuindo a um usuário, verificar se o usuário pertence à empresa
    if (updateTicketDto.assignedUserId) {
      const user = await this.prisma.user.findFirst({
        where: {
          id: updateTicketDto.assignedUserId,
          companyId,
        },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }
    }

    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: updateTicketDto,
      include: {
        contact: true,
        assignedTo: true,
      },
    });

    // Emitir evento WebSocket se o ticket foi atribuído
    if (updateTicketDto.assignedUserId && updateTicketDto.assignedUserId !== existingTicket.assignedUserId) {
      this.emitTicketAssignedEvent(ticket);
    }

    return ticket;
  }

  async remove(id: string, companyId: string) {
    // Verificar se o ticket existe e pertence à empresa
    const existingTicket = await this.prisma.ticket.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingTicket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    await this.prisma.ticket.delete({
      where: { id },
    });

    return { message: 'Ticket removido com sucesso' };
  }

  private emitTicketAssignedEvent(ticket: any) {
    // Implementação básica - em produção usar Socket.IO server
    this.logger.log(`Ticket ${ticket.id} assigned to user ${ticket.assignedUserId}`);
    // TODO: Implementar emissão real de evento WebSocket
  }
}
