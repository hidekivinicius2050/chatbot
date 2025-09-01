import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { QueryChannelsDto } from './dto/query-channels.dto';

@Injectable()
export class ChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createChannelDto: CreateChannelDto, companyId: string) {
    // Verificar se já existe um canal do mesmo tipo para a empresa
    const existingChannel = await this.prisma.channel.findFirst({
      where: {
        companyId,
        type: createChannelDto.type,
      },
    });

    if (existingChannel) {
      throw new BadRequestException(`Já existe um canal do tipo ${createChannelDto.type} para esta empresa`);
    }

    return this.prisma.channel.create({
      data: {
        ...createChannelDto,
        companyId,
        status: 'disconnected', // Inicialmente desconectado
      },
    });
  }

  async findAll(query: QueryChannelsDto, companyId: string) {
    const { type, status, cursor, limit = 20 } = query;

    const where: any = { companyId };
    if (type) where.type = type;
    if (status) where.status = status;

    const channels = await this.prisma.channel.findMany({
      where,
      take: limit + 1, // +1 para verificar se há próxima página
      ...(cursor && { cursor: { id: cursor } }),
      orderBy: { createdAt: 'desc' },
    });

    const hasNextPage = channels.length > limit;
    const items = hasNextPage ? channels.slice(0, -1) : channels;
    const nextCursor = hasNextPage && items.length > 0 ? items[items.length - 1]?.id : null;

    return { items, nextCursor, hasNextPage };
  }

  async findOne(id: string, companyId: string) {
    const channel = await this.prisma.channel.findFirst({
      where: { id, companyId },
    });

    if (!channel) {
      throw new NotFoundException('Canal não encontrado');
    }

    return channel;
  }

  async update(id: string, updateChannelDto: UpdateChannelDto, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.channel.update({
      where: { id },
      data: updateChannelDto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.channel.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.channel.update({
      where: { id },
      data: { status },
    });
  }

  async findByType(type: string, companyId: string) {
    return this.prisma.channel.findFirst({
      where: { type, companyId },
    });
  }
}
