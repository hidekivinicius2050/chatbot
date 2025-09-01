import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PluginsService } from './plugins.service';
import { EventsService } from '../webhooks/events.service';

@Controller('api/v1')
export class PluginsController {
  constructor(
    private pluginsService: PluginsService,
    private eventsService: EventsService,
  ) {}

  // Marketplace público
  @Get('plugins')
  async getMarketplace(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
    @Query('q') q?: string,
  ) {
    return this.pluginsService.getMarketplacePlugins(cursor, limit, q);
  }

  @Get('plugins/:slug')
  async getPluginDetails(@Param('slug') slug: string) {
    return this.pluginsService.getPluginBySlug(slug);
  }

  // Instalações (tenant-aware)
  @UseGuards(JwtAuthGuard)
  @Get('apps')
  async getInstallations(@Request() req: any) {
    return this.pluginsService.getInstallations(req.user.companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('apps/install')
  async installPlugin(@Request() req: any, @Body() body: any) {
    return this.pluginsService.installPlugin(req.user.companyId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('apps/:id')
  async getInstallation(@Request() req: any, @Param('id') id: string) {
    const installations = await this.pluginsService.getInstallations(req.user.companyId);
    const installation = installations.find(i => i.id === id);
    if (!installation) {
      throw new Error('Instalação não encontrada');
    }
    return installation;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('apps/:id')
  async updateInstallation(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    // TODO: implementar update de settings/status
    return { message: 'Update não implementado ainda' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('apps/:id')
  async uninstallPlugin(@Request() req: any, @Param('id') id: string) {
    await this.pluginsService.uninstallPlugin(req.user.companyId, id);
    return { message: 'Plugin desinstalado com sucesso' };
  }

  // Webhooks por instalação
  @UseGuards(JwtAuthGuard)
  @Post('apps/:id/webhooks')
  async createWebhook(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.pluginsService.createWebhookEndpoint(id, body);
  }

  // Tokens por instalação
  @UseGuards(JwtAuthGuard)
  @Post('apps/:id/tokens')
  async createToken(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.pluginsService.createAppToken(req.user.companyId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('apps/:id/tokens')
  async getTokens(@Request() req: any, @Param('id') id: string) {
    return this.pluginsService.getAppTokens(req.user.companyId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('apps/:id/tokens/:tokenId')
  async revokeToken(
    @Request() req: any,
    @Param('id') id: string,
    @Param('tokenId') tokenId: string,
  ) {
    await this.pluginsService.revokeAppToken(req.user.companyId, tokenId);
    return { message: 'Token revogado com sucesso' };
  }

  // Testar evento
  @UseGuards(JwtAuthGuard)
  @Post('apps/:id/test-event')
  async testEvent(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const { type = 'test.event', sample = {} } = body;

    await this.eventsService.publishEvent({
      companyId: req.user.companyId,
      key: type,
      refType: 'test',
      refId: id,
      payload: {
        test: true,
        timestamp: new Date().toISOString(),
        ...sample,
      },
    });

    return {
      message: 'Evento de teste enviado',
      type,
      timestamp: new Date().toISOString(),
    };
  }
}
