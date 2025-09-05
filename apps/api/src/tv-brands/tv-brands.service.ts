import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TVBrandInstructions {
  setup: string[];
  troubleshooting: string[];
  apps: string[];
  network: string[];
}

@Injectable()
export class TVBrandsService {
  private readonly logger = new Logger(TVBrandsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma nova marca de TV
   */
  async createBrand(data: {
    name: string;
    aliases: string[];
    instructions: TVBrandInstructions;
  }) {
    return this.prisma.tVBrand.create({
      data: {
        name: data.name,
        aliases: data.aliases,
        instructions: data.instructions,
      }
    });
  }

  /**
   * Lista todas as marcas ativas
   */
  async getActiveBrands() {
    return this.prisma.tVBrand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Busca marca por nome ou alias
   */
  async findBrandByInput(input: string) {
    const brands = await this.getActiveBrands();
    const normalizedInput = input.toLowerCase().trim();

    for (const brand of brands) {
      if (brand.aliases.some(alias => alias.toLowerCase() === normalizedInput)) {
        return brand;
      }
    }

    return null;
  }

  /**
   * Atualiza uma marca
   */
  async updateBrand(id: string, data: Partial<{
    name: string;
    aliases: string[];
    instructions: TVBrandInstructions;
    isActive: boolean;
  }>) {
    return this.prisma.tVBrand.update({
      where: { id },
      data
    });
  }

  /**
   * Remove uma marca (soft delete)
   */
  async deleteBrand(id: string) {
    return this.prisma.tVBrand.update({
      where: { id },
      data: { isActive: false }
    });
  }

  /**
   * Cria marcas padrão do sistema
   */
  async createDefaultBrands() {
    const defaultBrands = [
      {
        name: 'LG',
        aliases: ['lg', 'Lg', 'LG', '1'],
        instructions: {
          setup: [
            'Conecte o cabo HDMI do seu dispositivo IPTV à entrada HDMI da TV LG',
            'Ligue a TV e selecione a entrada HDMI correspondente',
            'Acesse as configurações de rede da TV (Configurações > Rede)',
            'Conecte à sua rede Wi-Fi ou cabo Ethernet'
          ],
          troubleshooting: [
            'Se não houver imagem: Verifique se o cabo HDMI está bem conectado',
            'Se não conectar à rede: Reinicie o roteador e tente novamente',
            'Se a imagem estiver pixelada: Verifique a qualidade do cabo HDMI',
            'Se não houver som: Verifique as configurações de áudio da TV'
          ],
          apps: [
            'Acesse a LG Content Store',
            'Procure por "IPTV Smarters" ou "VLC"',
            'Instale o aplicativo desejado',
            'Configure com suas credenciais IPTV'
          ],
          network: [
            'Configurações > Rede > Conexão Wi-Fi',
            'Selecione sua rede e digite a senha',
            'Para cabo: Configurações > Rede > Conexão com Cabo',
            'Teste a conexão após configurar'
          ]
        }
      },
      {
        name: 'Samsung',
        aliases: ['samsung', 'Samsung', 'SAMSUNG', '2'],
        instructions: {
          setup: [
            'Conecte o cabo HDMI do seu dispositivo IPTV à entrada HDMI da TV Samsung',
            'Ligue a TV e pressione o botão Source para selecionar HDMI',
            'Acesse Configurações > Geral > Rede',
            'Conecte à sua rede Wi-Fi ou cabo Ethernet'
          ],
          troubleshooting: [
            'Se não houver imagem: Verifique se o cabo HDMI está conectado corretamente',
            'Se não conectar à rede: Reinicie o roteador e a TV',
            'Se a imagem estiver distorcida: Verifique a resolução nas configurações',
            'Se não houver som: Verifique as configurações de áudio'
          ],
          apps: [
            'Acesse a Samsung Smart Hub',
            'Procure por "IPTV Smarters" ou "VLC" na loja',
            'Instale o aplicativo escolhido',
            'Configure com suas credenciais IPTV'
          ],
          network: [
            'Configurações > Geral > Rede > Configurações de Rede',
            'Selecione Wi-Fi e escolha sua rede',
            'Para cabo: Configurações > Geral > Rede > Configurações de Cabo',
            'Execute o teste de conexão'
          ]
        }
      },
      {
        name: 'Roku',
        aliases: ['roku', 'Roku', 'ROKU', '3'],
        instructions: {
          setup: [
            'Conecte o dispositivo Roku à TV via HDMI',
            'Ligue o Roku e siga o assistente de configuração',
            'Conecte à sua rede Wi-Fi durante a configuração',
            'Atualize o sistema se solicitado'
          ],
          troubleshooting: [
            'Se não houver sinal: Verifique as conexões HDMI e energia',
            'Se não conectar à rede: Verifique a senha do Wi-Fi',
            'Se travou: Desconecte a energia por 10 segundos e reconecte',
            'Se lento: Reinicie o dispositivo nas configurações'
          ],
          apps: [
            'Acesse a Roku Channel Store',
            'Procure por "IPTV Smarters" ou "VLC"',
            'Adicione o canal desejado',
            'Configure com suas credenciais IPTV'
          ],
          network: [
            'Configurações > Rede > Configuração de Conexão',
            'Selecione sua rede Wi-Fi',
            'Digite a senha da rede',
            'Teste a velocidade da conexão'
          ]
        }
      },
      {
        name: 'Xiaomi',
        aliases: ['xiaomi', 'Xiaomi', 'XIAOMI', 'mi', 'Mi', '4'],
        instructions: {
          setup: [
            'Conecte o cabo HDMI do seu dispositivo IPTV à TV Xiaomi',
            'Ligue a TV e selecione a entrada HDMI',
            'Acesse Configurações > Rede e Internet',
            'Conecte à sua rede Wi-Fi ou cabo Ethernet'
          ],
          troubleshooting: [
            'Se não houver imagem: Verifique as conexões HDMI',
            'Se não conectar à rede: Reinicie o roteador',
            'Se a imagem estiver ruim: Verifique a qualidade do cabo',
            'Se não houver som: Verifique as configurações de áudio'
          ],
          apps: [
            'Acesse a Mi Store ou Google Play Store',
            'Procure por "IPTV Smarters" ou "VLC"',
            'Instale o aplicativo desejado',
            'Configure com suas credenciais IPTV'
          ],
          network: [
            'Configurações > Rede e Internet > Wi-Fi',
            'Selecione sua rede e digite a senha',
            'Para cabo: Configurações > Rede e Internet > Ethernet',
            'Verifique a conexão após configurar'
          ]
        }
      }
    ];

    for (const brand of defaultBrands) {
      const existing = await this.prisma.tVBrand.findUnique({
        where: { name: brand.name }
      });

      if (!existing) {
        await this.createBrand(brand);
        this.logger.log(`Created default TV brand: ${brand.name}`);
      }
    }
  }
}
