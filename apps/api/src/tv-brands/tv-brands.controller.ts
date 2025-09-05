import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TVBrandsService, TVBrandInstructions } from './tv-brands.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

class CreateTVBrandDto {
  name: string;
  aliases: string[];
  instructions: TVBrandInstructions;
}

class UpdateTVBrandDto {
  name?: string;
  aliases?: string[];
  instructions?: TVBrandInstructions;
  isActive?: boolean;
}

@ApiTags('TV Brands')
@Controller('tv-brands')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TVBrandsController {
  constructor(private readonly tvBrandsService: TVBrandsService) {}

  @Get()
  @Roles('admin', 'agent', 'owner')
  @ApiOperation({ summary: 'Lista todas as marcas de TV ativas' })
  @ApiResponse({ status: 200, description: 'Lista de marcas retornada com sucesso' })
  async getBrands() {
    const brands = await this.tvBrandsService.getActiveBrands();
    return {
      success: true,
      data: brands
    };
  }

  @Get('find/:input')
  @Roles('admin', 'agent', 'owner')
  @ApiOperation({ summary: 'Busca marca de TV por nome ou alias' })
  @ApiResponse({ status: 200, description: 'Marca encontrada' })
  @ApiResponse({ status: 404, description: 'Marca não encontrada' })
  async findBrand(@Param('input') input: string) {
    const brand = await this.tvBrandsService.findBrandByInput(input);
    if (!brand) {
      return {
        success: false,
        message: 'Marca de TV não encontrada'
      };
    }
    return {
      success: true,
      data: brand
    };
  }

  @Post()
  @Roles('admin', 'owner')
  @ApiOperation({ summary: 'Cria nova marca de TV' })
  @ApiResponse({ status: 201, description: 'Marca criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createBrand(@Body() body: CreateTVBrandDto) {
    const brand = await this.tvBrandsService.createBrand(body);
    return {
      success: true,
      message: 'Marca criada com sucesso',
      data: brand
    };
  }

  @Put(':id')
  @Roles('admin', 'owner')
  @ApiOperation({ summary: 'Atualiza marca de TV' })
  @ApiResponse({ status: 200, description: 'Marca atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Marca não encontrada' })
  async updateBrand(@Param('id') id: string, @Body() body: UpdateTVBrandDto) {
    const brand = await this.tvBrandsService.updateBrand(id, body);
    return {
      success: true,
      message: 'Marca atualizada com sucesso',
      data: brand
    };
  }

  @Delete(':id')
  @Roles('admin', 'owner')
  @ApiOperation({ summary: 'Remove marca de TV' })
  @ApiResponse({ status: 200, description: 'Marca removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Marca não encontrada' })
  async deleteBrand(@Param('id') id: string) {
    await this.tvBrandsService.deleteBrand(id);
    return {
      success: true,
      message: 'Marca removida com sucesso'
    };
  }

  @Post('setup-default-brands')
  @Roles('admin', 'owner')
  @ApiOperation({ summary: 'Cria marcas padrão do sistema' })
  @ApiResponse({ status: 200, description: 'Marcas padrão criadas com sucesso' })
  async setupDefaultBrands() {
    await this.tvBrandsService.createDefaultBrands();
    return {
      success: true,
      message: 'Marcas padrão criadas com sucesso'
    };
  }
}
