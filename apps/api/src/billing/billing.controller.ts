import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DevAuthGuard } from '../auth/guards/dev-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BillingService } from './billing.service';

@ApiTags('billing')
@Controller('billing')
@UseGuards(DevAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('entitlements')
  @ApiOperation({ summary: 'Obter recursos disponíveis' })
  @ApiResponse({ status: 200, description: 'Recursos obtidos' })
  getEntitlements(@Request() req: any) {
    return { message: 'Entitlements not implemented yet' };
  }

  @Get('usage')
  @ApiOperation({ summary: 'Obter uso atual' })
  @ApiResponse({ status: 200, description: 'Uso obtido' })
  getUsage(@Request() req: any) {
    return { message: 'Usage not implemented yet' };
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Obter detalhes da assinatura' })
  @ApiResponse({ status: 200, description: 'Assinatura obtida' })
  getSubscription(@Request() req: any) {
    return this.billingService.getSubscription(req.user.companyId);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Listar faturas' })
  @ApiResponse({ status: 200, description: 'Lista de faturas' })
  getInvoices(@Request() req: any) {
    return this.billingService.getInvoices(req.user.companyId);
  }

  @Post('checkout')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Criar checkout' })
  @ApiResponse({ status: 201, description: 'Checkout criado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  createCheckout(@Body() checkoutData: any, @Request() req: any) {
    return this.billingService.createCheckoutSession(req.user.companyId, checkoutData);
  }

  @Get('portal')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Obter URL do portal de billing' })
  @ApiResponse({ status: 200, description: 'URL do portal obtida' })
  getPortalUrl(@Request() req: any) {
    return this.billingService.createCustomerPortalSession(req.user.companyId);
  }

  @Post('mock/upgrade')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Simular upgrade de plano' })
  @ApiResponse({ status: 200, description: 'Upgrade simulado' })
  mockUpgrade(@Body() upgradeData: any, @Request() req: any) {
    return this.billingService.mockUpgrade(req.user.companyId, upgradeData);
  }

  @Post('mock/cancel')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Simular cancelamento de plano' })
  @ApiResponse({ status: 200, description: 'Cancelamento simulado' })
  mockCancel(@Request() req: any) {
    return this.billingService.mockCancel(req.user.companyId);
  }
}
