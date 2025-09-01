import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { BillingService } from './billing.service';
import { EntitlementsService } from './entitlements.service';
import { CheckoutDto, MockUpgradeDto } from './dto/billing.dto';

@ApiTags('Billing')
@Controller('api/v1/billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  @Get('entitlements')
  @ApiOperation({ summary: 'Get current entitlements' })
  @ApiResponse({ status: 200, description: 'Entitlements retrieved successfully' })
  async getEntitlements(@Request() req: any) {
    const companyId = req.companyId;
    return this.entitlementsService.get(companyId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get current usage' })
  @ApiResponse({ status: 200, description: 'Usage data retrieved successfully' })
  async getUsage(@Request() req: any) {
    const companyId = req.companyId;
    return this.entitlementsService.getUsage(companyId);
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Get current subscription' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  async getSubscription(@Request() req: any) {
    const companyId = req.companyId;
    return this.billingService.getSubscription(companyId);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  async getInvoices(@Request() req: any) {
    const companyId = req.companyId;
    return this.billingService.getInvoices(companyId);
  }

  @Post('checkout')
  // @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Create checkout session' })
  @ApiResponse({ status: 201, description: 'Checkout session created successfully' })
  async createCheckout(@Request() req: any, @Body() checkoutDto: CheckoutDto) {
    const companyId = req.companyId;
    return this.billingService.createCheckoutSession(companyId, checkoutDto);
  }

  @Get('portal')
  // @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Create customer portal session' })
  @ApiResponse({ status: 200, description: 'Portal session created successfully' })
  async createPortalSession(@Request() req: any) {
    const companyId = req.companyId;
    return this.billingService.createCustomerPortalSession(companyId);
  }

  @Post('mock/upgrade')
  // @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Mock upgrade subscription' })
  @ApiResponse({ status: 201, description: 'Subscription upgraded successfully' })
  async mockUpgrade(@Request() req: any, @Body() upgradeDto: MockUpgradeDto) {
    const companyId = req.companyId;
    return this.billingService.mockUpgrade(companyId, upgradeDto);
  }

  @Post('mock/cancel')
  // @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mock cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription canceled successfully' })
  async mockCancel(@Request() req: any) {
    const companyId = req.companyId;
    return this.billingService.mockCancel(companyId);
  }
}
