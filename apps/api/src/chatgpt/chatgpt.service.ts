import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatGPTResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class ChatGPTService {
  private readonly logger = new Logger(ChatGPTService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
    this.baseUrl = this.configService.get<string>('OPENAI_BASE_URL', 'https://api.openai.com/v1');
  }

  /**
   * Envia mensagem para ChatGPT usando um perfil específico
   */
  async sendMessage(
    profileId: string,
    userMessage: string,
    conversationHistory: ChatGPTMessage[] = []
  ): Promise<ChatGPTResponse> {
    try {
      // Busca o perfil do ChatGPT
      const profile = await this.prisma.chatGPTProfile.findUnique({
        where: { id: profileId, isActive: true }
      });

      if (!profile) {
        throw new Error(`Perfil ChatGPT não encontrado: ${profileId}`);
      }

      // Prepara as mensagens
      const messages: ChatGPTMessage[] = [
        {
          role: 'system',
          content: profile.systemPrompt
        },
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ];

      // Chama a API do OpenAI
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: profile.temperature,
          max_tokens: profile.maxTokens,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0]?.message?.content || '';
      const usage = response.data.usage;

      this.logger.log(`ChatGPT response generated for profile: ${profile.name}`);

      return {
        content,
        usage
      };

    } catch (error) {
      this.logger.error(`Error calling ChatGPT API: ${error.message}`);
      throw new Error(`Erro ao processar mensagem com ChatGPT: ${error.message}`);
    }
  }

  /**
   * Cria um novo perfil de ChatGPT
   */
  async createProfile(data: {
    name: string;
    description?: string;
    systemPrompt: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    return this.prisma.chatGPTProfile.create({
      data: {
        name: data.name,
        description: data.description,
        systemPrompt: data.systemPrompt,
        temperature: data.temperature || 0.7,
        maxTokens: data.maxTokens || 1000,
      }
    });
  }

  /**
   * Lista todos os perfis ativos
   */
  async getActiveProfiles() {
    return this.prisma.chatGPTProfile.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Busca perfil por nome
   */
  async getProfileByName(name: string) {
    return this.prisma.chatGPTProfile.findUnique({
      where: { name, isActive: true }
    });
  }

  /**
   * Atualiza um perfil
   */
  async updateProfile(id: string, data: Partial<{
    name: string;
    description: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    isActive: boolean;
  }>) {
    return this.prisma.chatGPTProfile.update({
      where: { id },
      data
    });
  }

  /**
   * Remove um perfil (soft delete)
   */
  async deleteProfile(id: string) {
    return this.prisma.chatGPTProfile.update({
      where: { id },
      data: { isActive: false }
    });
  }

  /**
   * Cria perfis padrão para o sistema
   */
  async createDefaultProfiles() {
    const defaultProfiles = [
      {
        name: 'Suporte Técnico IPTV',
        description: 'Especialista em suporte técnico para IPTV',
        systemPrompt: `Você é um especialista em suporte técnico IPTV. Sua função é apenas resolver problemas técnicos relacionados ao IPTV.

INSTRUÇÕES:
- Seja técnico, preciso e focado em soluções
- Forneça instruções passo a passo
- Se não souber algo, seja honesto e sugira contatar suporte
- Mantenha tom profissional e prestativo
- Foque apenas em questões técnicas de IPTV

NÃO responda sobre:
- Vendas ou planos
- Questões financeiras
- Outros produtos que não sejam IPTV`
      },
      {
        name: 'Instalação de Apps',
        description: 'Especialista em instalação de aplicativos IPTV',
        systemPrompt: `Você é um especialista em instalação de aplicativos IPTV. Sua função é apenas ajudar com instalação de apps.

INSTRUÇÕES:
- Seja didático, passo a passo e paciente
- Forneça instruções claras e detalhadas
- Inclua screenshots ou descrições visuais quando possível
- Teste as instruções antes de fornecer
- Mantenha tom amigável e encorajador

NÃO responda sobre:
- Problemas técnicos complexos
- Vendas ou planos
- Outros tópicos que não sejam instalação de apps`
      },
      {
        name: 'Vendas e Planos',
        description: 'Especialista em vendas de planos IPTV',
        systemPrompt: `Você é um especialista em vendas de planos IPTV. Sua função é apenas apresentar planos e converter leads.

INSTRUÇÕES:
- Seja persuasivo, informativo e focado em benefícios
- Destaque as vantagens de cada plano
- Use linguagem de vendas eficaz
- Faça perguntas para entender as necessidades do cliente
- Mantenha tom profissional e confiante

NÃO responda sobre:
- Problemas técnicos
- Instalação de aplicativos
- Outros tópicos que não sejam vendas`
      },
      {
        name: 'Configuração de Dispositivos',
        description: 'Especialista em configuração de dispositivos para IPTV',
        systemPrompt: `Você é um especialista em configuração de dispositivos para IPTV. Sua função é apenas ajudar com setup de equipamentos.

INSTRUÇÕES:
- Forneça instruções específicas para cada marca/modelo
- Seja detalhado e preciso
- Inclua configurações de rede quando necessário
- Teste as configurações antes de fornecer
- Mantenha tom técnico mas acessível

NÃO responda sobre:
- Vendas ou planos
- Problemas de aplicativos
- Outros tópicos que não sejam configuração de dispositivos`
      }
    ];

    for (const profile of defaultProfiles) {
      const existing = await this.prisma.chatGPTProfile.findUnique({
        where: { name: profile.name }
      });

      if (!existing) {
        await this.createProfile(profile);
        this.logger.log(`Created default profile: ${profile.name}`);
      }
    }
  }
}
