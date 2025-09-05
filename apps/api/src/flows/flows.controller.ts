import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DevAuthGuard } from '../auth/guards/dev-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { FlowsService, FlowExecutionContext } from './flows.service';
import { CreateFlowDto } from './dto/create-flow.dto';
import { UpdateFlowDto } from './dto/update-flow.dto';
import { QueryFlowsDto } from './dto/query-flows.dto';

@ApiTags('flows')
@Controller('flows')
@UseGuards(DevAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FlowsController {
  constructor(private readonly flowsService: FlowsService) {}

  @Post()
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Criar novo fluxo' })
  @ApiResponse({ status: 201, description: 'Fluxo criado com sucesso' })
  async create(@Body() createFlowDto: CreateFlowDto, @Request() req: any) {
    return this.flowsService.create(createFlowDto, req.user.companyId);
  }

  @Get()
  @Roles('ADMIN', 'AGENT', 'OWNER')
  @ApiOperation({ summary: 'Listar fluxos' })
  @ApiResponse({ status: 200, description: 'Lista de fluxos' })
  async findAll(@Query() query: QueryFlowsDto, @Request() req: any) {
    return this.flowsService.findAll(query, req.user.companyId);
  }

  @Get(':id')
  @Roles('ADMIN', 'AGENT', 'OWNER')
  @ApiOperation({ summary: 'Buscar fluxo por ID' })
  @ApiResponse({ status: 200, description: 'Fluxo encontrado' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.flowsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Atualizar fluxo' })
  @ApiResponse({ status: 200, description: 'Fluxo atualizado com sucesso' })
  async update(
    @Param('id') id: string,
    @Body() updateFlowDto: UpdateFlowDto,
    @Request() req: any,
  ) {
    return this.flowsService.update(id, updateFlowDto, req.user.companyId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Deletar fluxo' })
  @ApiResponse({ status: 200, description: 'Fluxo deletado com sucesso' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.flowsService.remove(id, req.user.companyId);
  }

  @Post(':id/activate')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Ativar fluxo' })
  @ApiResponse({ status: 200, description: 'Fluxo ativado com sucesso' })
  async activate(@Param('id') id: string, @Request() req: any) {
    return this.flowsService.activate(id, req.user.companyId);
  }

  @Post(':id/pause')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Pausar fluxo' })
  @ApiResponse({ status: 200, description: 'Fluxo pausado com sucesso' })
  async pause(@Param('id') id: string, @Request() req: any) {
    return this.flowsService.pause(id, req.user.companyId);
  }

  @Post(':id/duplicate')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Duplicar fluxo' })
  @ApiResponse({ status: 201, description: 'Fluxo duplicado com sucesso' })
  async duplicate(@Param('id') id: string, @Request() req: any) {
    return this.flowsService.duplicate(id, req.user.companyId);
  }

  // ===== NOVOS ENDPOINTS PARA SISTEMA DE FLUXOS AVANÇADO =====

  @Post('execute')
  @Roles('ADMIN', 'AGENT', 'OWNER')
  @ApiOperation({ summary: 'Executa um fluxo com mensagem do usuário' })
  @ApiResponse({ status: 200, description: 'Fluxo executado com sucesso' })
  async executeFlow(@Body() body: {
    flowId: string;
    phoneNumber: string;
    message: string;
    context?: Partial<FlowExecutionContext>;
  }) {
    const context: FlowExecutionContext = {
      phoneNumber: body.phoneNumber,
      currentFlowId: body.flowId,
      variables: body.context?.variables || {},
      conversationHistory: body.context?.conversationHistory || [],
      ...body.context
    };

    return this.flowsService.executeFlow(context, body.message);
  }

  @Post('nodes')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Cria um novo nó no fluxo' })
  @ApiResponse({ status: 201, description: 'Nó criado com sucesso' })
  async createFlowNode(@Body() body: {
    flowId: string;
    name: string;
    description?: string;
    nodeType: 'chatgpt' | 'message' | 'condition' | 'action';
    position: { x: number; y: number };
    config: any;
    chatgptProfileId?: string;
  }) {
    return this.flowsService.createFlowNode(body);
  }

  @Post('connections')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Conecta dois nós do fluxo' })
  @ApiResponse({ status: 201, description: 'Nós conectados com sucesso' })
  async connectNodes(@Body() body: {
    fromNodeId: string;
    toNodeId: string;
    condition?: string;
  }) {
    return this.flowsService.connectNodes(body);
  }

  @Post('setup-default-tv-flow')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Cria fluxo padrão de identificação de TV' })
  @ApiResponse({ status: 201, description: 'Fluxo padrão criado com sucesso' })
  async setupDefaultTVFlow() {
    const flow = await this.flowsService.createDefaultTVFlow();
    return {
      success: true,
      message: 'Fluxo padrão de TV criado com sucesso',
      data: flow
    };
  }
}


