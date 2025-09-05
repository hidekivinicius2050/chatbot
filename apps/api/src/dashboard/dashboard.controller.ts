import { Controller, Get, UseGuards } from '@nestjs/common';
import { DevAuthGuard } from '../auth/guards/dev-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(DevAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas do dashboard' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas com sucesso' })
  getStats() {
    return {
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0,
      totalContacts: 0,
      totalChannels: 0,
      avgResponseTime: 0,
    };
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Obter atividades recentes' })
  @ApiResponse({ status: 200, description: 'Atividades obtidas com sucesso' })
  getRecentActivity() {
    return {
      activities: [],
    };
  }
}
