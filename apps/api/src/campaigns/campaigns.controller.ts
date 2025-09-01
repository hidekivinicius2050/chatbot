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
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { FeatureGuard } from '../billing/guards/feature.guard';
// import { RequireFeature } from '../billing/decorators/require-feature.decorator';
import { QuotaGuard } from '../billing/guards/quota.guard';
import { RequireQuota } from '../billing/decorators/quota.decorator';
import { CampaignsService } from './campaigns.service';
import { OptOutService } from './opt-out.service';
import { ReportsService } from './reports.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  QueryCampaignsDto,
  AddTargetsDto,
  OptOutDto,
  ReportsQueryDto,
} from './dto';

@ApiTags('campaigns')
@Controller('api/v1/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CampaignsController {
  private readonly logger = new Logger(CampaignsController.name);

  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly optOutService: OptOutService,
    private readonly reportsService: ReportsService,
  ) {}

  /**
   * Cria uma nova campanha
   *
   * FRONTEND: Deve mostrar:
   * - Formulário de criação com validação em tempo real
   * - Seleção de canal disponível
   * - Preview da mensagem
   * - Configurações de agendamento
   * - Validação de permissões
   */
  @Post()
  // @UseGuards(FeatureGuard)
  // @RequireFeature('feature.campaigns')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({
    summary: 'Criar nova campanha',
    description: 'Cria uma nova campanha de envio em massa'
  })
  @ApiResponse({ status: 201, description: 'Campanha criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou canal não conectado' })
  @ApiResponse({ status: 403, description: 'Feature não disponível no plano atual' })
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
    @Request() req: any,
  ) {
    this.logger.log(`Tentativa de criação de campanha por usuário ${req.user.id}`);

    try {
      const campaign = await this.campaignsService.create(
        createCampaignDto,
        req.user.companyId,
        req.user.id,
      );
      this.logger.log(`Campanha criada com sucesso: ${campaign.id}`);
      return campaign;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na criação da campanha: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Lista campanhas com filtros e paginação
   *
   * FRONTEND: Deve mostrar:
   * - Lista paginada de campanhas
   * - Filtros por status, tipo, canal, datas
   * - Indicadores visuais de status
   * - Ações disponíveis por campanha
   * - Estatísticas resumidas
   */
  @Get()
  @Roles('ADMIN', 'AGENT', 'OWNER', 'VIEWER')
  @ApiOperation({
    summary: 'Listar campanhas',
    description: 'Lista campanhas com filtros e paginação'
  })
  @ApiResponse({ status: 200, description: 'Lista de campanhas' })
  async findAll(@Query() query: QueryCampaignsDto, @Request() req: any) {
    this.logger.log(`Listagem de campanhas solicitada por usuário ${req.user.id}`);

    try {
      const result = await this.campaignsService.findAll(query, req.user.companyId);
      this.logger.log(`${result.campaigns.length} campanhas encontradas`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na listagem de campanhas: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Busca uma campanha específica
   *
   * FRONTEND: Deve mostrar:
   * - Detalhes completos da campanha
   * - Estatísticas de envio
   * - Lista de alvos
   * - Histórico de execuções
   * - Ações disponíveis
   */
  @Get(':id')
  @Roles('ADMIN', 'AGENT', 'OWNER', 'VIEWER')
  @ApiOperation({
    summary: 'Buscar campanha',
    description: 'Busca uma campanha específica por ID'
  })
  @ApiParam({ name: 'id', description: 'ID da campanha' })
  @ApiResponse({ status: 200, description: 'Campanha encontrada' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Busca de campanha solicitada: ${id}`);

    try {
      const campaign = await this.campaignsService.findOne(id, req.user.companyId);
      this.logger.log(`Campanha encontrada: ${id}`);
      return campaign;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na busca da campanha ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Atualiza uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Formulário de edição pré-preenchido
   * - Validação de campos modificados
   * - Confirmação antes de salvar
   * - Histórico de alterações
   */
  @Patch(':id')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({
    summary: 'Atualizar campanha',
    description: 'Atualiza uma campanha existente'
  })
  @ApiParam({ name: 'id', description: 'ID da campanha' })
  @ApiResponse({ status: 200, description: 'Campanha atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  @ApiResponse({ status: 400, description: 'Não é possível editar esta campanha' })
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Request() req: any,
  ) {
    this.logger.log(`Tentativa de atualização da campanha ${id}`);

    try {
      const campaign = await this.campaignsService.update(
        id,
        updateCampaignDto,
        req.user.companyId,
      );
      this.logger.log(`Campanha atualizada com sucesso: ${id}`);
      return campaign;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na atualização da campanha ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Remove uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de exclusão
   * - Impacto da exclusão (alvos, execuções)
   * - Opção de cancelar em vez de excluir
   */
  @Delete(':id')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({
    summary: 'Remover campanha',
    description: 'Remove uma campanha existente'
  })
  @ApiParam({ name: 'id', description: 'ID da campanha' })
  @ApiResponse({ status: 200, description: 'Campanha removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  @ApiResponse({ status: 400, description: 'Não é possível excluir esta campanha' })
  async remove(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Tentativa de remoção da campanha ${id}`);

    try {
      const result = await this.campaignsService.remove(id, req.user.companyId);
      this.logger.log(`Campanha removida com sucesso: ${id}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na remoção da campanha ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Adiciona alvos a uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Seleção de contatos disponíveis
   * - Validação de duplicatas
   * - Confirmação de adição
   * - Atualização da lista de alvos
   */
  @Post(':id/targets')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({
    summary: 'Adicionar alvos',
    description: 'Adiciona contatos como alvos de uma campanha'
  })
  @ApiParam({ name: 'id', description: 'ID da campanha' })
  @ApiResponse({ status: 200, description: 'Alvos adicionados com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou contatos não encontrados' })
  async addTargets(
    @Param('id') id: string,
    @Body() addTargetsDto: AddTargetsDto,
    @Request() req: any,
  ) {
    this.logger.log(`Tentativa de adição de ${addTargetsDto.contactIds.length} alvos à campanha ${id}`);

    try {
      const result = await this.campaignsService.addTargets(
        id,
        addTargetsDto,
        req.user.companyId,
      );
      this.logger.log(`Alvos adicionados com sucesso à campanha ${id}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na adição de alvos à campanha ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Inicia uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de início
   * - Progresso em tempo real
   * - Estatísticas de envio
   * - Controles de pausa/parada
   */
  @Post(':id/start')
  @UseGuards(QuotaGuard)
  @RequireQuota({ key: 'campaigns.daily', increment: 1 })
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({
    summary: 'Iniciar campanha',
    description: 'Inicia a execução de uma campanha'
  })
  @ApiParam({ name: 'id', description: 'ID da campanha' })
  @ApiResponse({ status: 200, description: 'Campanha iniciada com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  @ApiResponse({ status: 400, description: 'Campanha não pode ser iniciada' })
  @ApiResponse({ status: 403, description: 'Quota diária de campanhas excedida' })
  async start(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Tentativa de início da campanha ${id}`);

    try {
      const result = await this.campaignsService.start(id, req.user.companyId);
      this.logger.log(`Campanha iniciada com sucesso: ${id}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha no início da campanha ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Pausa uma campanha em execução
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de pausa
   * - Status atualizado
   * - Opção de retomar
   */
  @Post(':id/pause')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({
    summary: 'Pausar campanha',
    description: 'Pausa uma campanha em execução'
  })
  @ApiParam({ name: 'id', description: 'ID da campanha' })
  @ApiResponse({ status: 200, description: 'Campanha pausada com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  @ApiResponse({ status: 400, description: 'Campanha não pode ser pausada' })
  async pause(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Tentativa de pausa da campanha ${id}`);

    try {
      const result = await this.campaignsService.pause(id, req.user.companyId);
      this.logger.log(`Campanha pausada com sucesso: ${id}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na pausa da campanha ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Retoma uma campanha pausada
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de retomada
   * - Status atualizado
   * - Progresso continuado
   */
  @Post(':id/resume')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({
    summary: 'Retomar campanha',
    description: 'Retoma uma campanha pausada'
  })
  @ApiParam({ name: 'id', description: 'ID da campanha' })
  @ApiResponse({ status: 200, description: 'Campanha retomada com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  @ApiResponse({ status: 400, description: 'Campanha não pode ser retomada' })
  async resume(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Tentativa de retomada da campanha ${id}`);

    try {
      const result = await this.campaignsService.resume(id, req.user.companyId);
      this.logger.log(`Campanha retomada com sucesso: ${id}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na retomada da campanha ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Finaliza uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de finalização
   * - Resumo final
   * - Relatórios disponíveis
   */
  @Post(':id/finish')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({
    summary: 'Finalizar campanha',
    description: 'Finaliza uma campanha em execução ou pausada'
  })
  @ApiParam({ name: 'id', description: 'ID da campanha' })
  @ApiResponse({ status: 200, description: 'Campanha finalizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  @ApiResponse({ status: 400, description: 'Campanha não pode ser finalizada' })
  async finish(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Tentativa de finalização da campanha ${id}`);

    try {
      const result = await this.campaignsService.finish(id, req.user.companyId);
      this.logger.log(`Campanha finalizada com sucesso: ${id}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na finalização da campanha ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Cancela uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de cancelamento
   * - Impacto do cancelamento
   * - Opção de reativar
   */
  @Post(':id/cancel')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({
    summary: 'Cancelar campanha',
    description: 'Cancela uma campanha'
  })
  @ApiParam({ name: 'id', description: 'ID da campanha' })
  @ApiResponse({ status: 200, description: 'Campanha cancelada com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  @ApiResponse({ status: 400, description: 'Campanha não pode ser cancelada' })
  async cancel(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Tentativa de cancelamento da campanha ${id}`);

    try {
      const result = await this.campaignsService.cancel(id, req.user.companyId);
      this.logger.log(`Campanha cancelada com sucesso: ${id}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha no cancelamento da campanha ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Métricas de envio
   * - Gráficos de progresso
   * - Comparativos com outras campanhas
   * - Exportação de dados
   */
  @Get(':id/stats')
  @Roles('ADMIN', 'AGENT', 'OWNER', 'VIEWER')
  @ApiOperation({
    summary: 'Estatísticas da campanha',
    description: 'Obtém estatísticas detalhadas de uma campanha'
  })
  @ApiParam({ name: 'id', description: 'ID da campanha' })
  @ApiResponse({ status: 200, description: 'Estatísticas da campanha' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  async getStats(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Solicitação de estatísticas da campanha ${id}`);

    try {
      const stats = await this.campaignsService.getStats(id, req.user.companyId);
      this.logger.log(`Estatísticas obtidas para campanha ${id}`);
      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha ao obter estatísticas da campanha ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Adiciona um opt-out
   *
   * FRONTEND: Deve mostrar:
   * - Formulário de opt-out
   * - Confirmação de cancelamento
   * - Opção de reativar posteriormente
   * - Histórico de opt-outs
   */
  @Post('opt-out')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({
    summary: 'Adicionar opt-out',
    description: 'Adiciona um opt-out para um contato em um canal'
  })
  @ApiResponse({ status: 201, description: 'Opt-out criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou opt-out já existe' })
  async addOptOut(@Body() optOutDto: OptOutDto, @Request() req: any) {
    this.logger.log(`Tentativa de criação de opt-out para contato ${optOutDto.contactId}`);

    try {
      const optOut = await this.optOutService.addOptOut(optOutDto, req.user.companyId);
      this.logger.log(`Opt-out criado com sucesso: ${optOut.id}`);
      return optOut;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na criação do opt-out: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Remove um opt-out (reativa o contato)
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de reativação
   * - Impacto nas campanhas futuras
   * - Histórico de alterações
   */
  @Delete('opt-out/:contactId/:channelId')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({
    summary: 'Remover opt-out',
    description: 'Remove um opt-out, reativando o contato para o canal'
  })
  @ApiParam({ name: 'contactId', description: 'ID do contato' })
  @ApiParam({ name: 'channelId', description: 'ID do canal' })
  @ApiResponse({ status: 200, description: 'Opt-out removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Opt-out não encontrado' })
  async removeOptOut(
    @Param('contactId') contactId: string,
    @Param('channelId') channelId: string,
    @Request() req: any,
  ) {
    this.logger.log(`Tentativa de remoção de opt-out: contato ${contactId}, canal ${channelId}`);

    try {
      const result = await this.optOutService.removeOptOut(
        contactId,
        channelId,
        req.user.companyId,
      );
      this.logger.log(`Opt-out removido com sucesso: contato ${contactId}, canal ${channelId}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na remoção do opt-out: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Lista opt-outs com filtros
   *
   * FRONTEND: Deve mostrar:
   * - Lista de opt-outs
   * - Filtros por contato, canal, fonte
   * - Ações disponíveis
   * - Estatísticas
   */
  @Get('opt-out')
  @Roles('ADMIN', 'OWNER', 'VIEWER')
  @ApiOperation({
    summary: 'Listar opt-outs',
    description: 'Lista opt-outs com filtros'
  })
  @ApiResponse({ status: 200, description: 'Lista de opt-outs' })
  async listOptOuts(
    @Query() filters: { contactId?: string; channelId?: string; source?: string },
    @Request() req: any,
  ) {
    this.logger.log(`Listagem de opt-outs solicitada por usuário ${req.user.id}`);

    try {
      const optOuts = await this.optOutService.listOptOuts(req.user.companyId, filters);
      this.logger.log(`${optOuts.length} opt-outs encontrados`);
      return optOuts;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na listagem de opt-outs: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Gera relatórios de campanhas
   *
   * FRONTEND: Deve mostrar:
   * - Seleção de tipo de relatório
   * - Filtros de data e campanha
   * - Visualização dos dados
   * - Exportação de relatórios
   */
  @Get('reports')
  @Roles('ADMIN', 'OWNER', 'VIEWER')
  @ApiOperation({
    summary: 'Gerar relatórios',
    description: 'Gera relatórios de campanhas por tipo'
  })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso' })
  async generateReports(@Query() query: ReportsQueryDto, @Request() req: any) {
    this.logger.log(`Geração de relatório solicitada: tipo ${query.type}`);

    try {
      let report;

      switch (query.type) {
        case 'daily':
          report = await this.reportsService.generateDailyReport(
            req.user.companyId,
            query.startDate ? new Date(query.startDate) : new Date(),
          );
          break;

        case 'campaign':
          if (!query.campaignId) {
            throw new Error('ID da campanha é obrigatório para relatórios de campanha');
          }
          report = await this.reportsService.generateCampaignReport(
            query.campaignId,
            req.user.companyId,
          );
          break;

        case 'summary':
          report = await this.reportsService.generateSummaryReport(
            req.user.companyId,
            query.startDate ? new Date(query.startDate) : undefined,
            query.endDate ? new Date(query.endDate) : undefined,
          );
          break;

        default:
          throw new Error('Tipo de relatório não suportado');
      }

      this.logger.log(`Relatório gerado com sucesso: tipo ${query.type}`);
      return report;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na geração do relatório: ${errorMessage}`);
      throw error;
    }
  }
}
