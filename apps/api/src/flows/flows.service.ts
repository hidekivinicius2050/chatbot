import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGPTService } from '../chatgpt/chatgpt.service';

export interface FlowNodeConfig {
  message?: string;
  condition?: string;
  action?: string;
  chatgptProfileId?: string;
  tvBrandId?: string;
}

export interface FlowExecutionContext {
  phoneNumber: string;
  currentFlowId: string;
  currentNodeId?: string;
  variables: Record<string, any>;
  conversationHistory: any[];
}

@Injectable()
export class FlowsService {
  private readonly logger = new Logger(FlowsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatgptService: ChatGPTService,
  ) {}

  /**
   * Cria um novo fluxo
   */
  async createFlow(data: {
    name: string;
    description?: string;
  }) {
    return this.prisma.flow.create({
      data,
      include: {
        nodes: {
          include: {
            chatgptProfile: true,
            connections: true
          }
        }
      }
    });
  }

  /**
   * Lista todos os fluxos ativos
   */
  async getActiveFlows() {
    return this.prisma.flow.findMany({
      where: { isActive: true },
      include: {
        nodes: {
          include: {
            chatgptProfile: true,
            connections: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Busca fluxo por ID
   */
  async getFlowById(id: string) {
    return this.prisma.flow.findUnique({
      where: { id },
      include: {
        nodes: {
          include: {
            chatgptProfile: true,
            connections: {
              include: {
                toNode: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Cria um nó no fluxo
   */
  async createFlowNode(data: {
    flowId: string;
    name: string;
    description?: string;
    nodeType: 'chatgpt' | 'message' | 'condition' | 'action';
    position: { x: number; y: number };
    config: FlowNodeConfig;
    chatgptProfileId?: string;
  }) {
    return this.prisma.flowNode.create({
      data: {
        flowId: data.flowId,
        name: data.name,
        description: data.description,
        nodeType: data.nodeType,
        position: data.position,
        config: data.config,
        chatgptProfileId: data.chatgptProfileId,
      },
      include: {
        chatgptProfile: true
      }
    });
  }

  /**
   * Conecta dois nós do fluxo
   */
  async connectNodes(data: {
    fromNodeId: string;
    toNodeId: string;
    condition?: string;
  }) {
    return this.prisma.flowConnection.create({
      data: {
        fromNodeId: data.fromNodeId,
        toNodeId: data.toNodeId,
        condition: data.condition,
      }
    });
  }

  /**
   * Executa um fluxo a partir de uma mensagem
   */
  async executeFlow(context: FlowExecutionContext, userMessage: string) {
    try {
      const flow = await this.getFlowById(context.currentFlowId);
      if (!flow) {
        throw new Error('Fluxo não encontrado');
      }

      // Se não há nó atual, começa pelo primeiro nó
      let currentNode = context.currentNodeId 
        ? flow.nodes.find(n => n.id === context.currentNodeId)
        : flow.nodes[0];

      if (!currentNode) {
        throw new Error('Nó inicial não encontrado');
      }

      // Processa o nó atual
      const result = await this.processNode(currentNode, userMessage, context);

      // Determina o próximo nó
      const nextNode = await this.getNextNode(currentNode, userMessage, context);

      return {
        success: true,
        data: {
          response: result.response,
          nextNodeId: nextNode?.id,
          updatedContext: {
            ...context,
            currentNodeId: nextNode?.id,
            variables: result.updatedVariables || context.variables,
            conversationHistory: [
              ...context.conversationHistory,
              { role: 'user', content: userMessage },
              { role: 'assistant', content: result.response }
            ]
          }
        }
      };

    } catch (error) {
      this.logger.error(`Error executing flow: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Processa um nó específico
   */
  private async processNode(node: any, userMessage: string, context: FlowExecutionContext) {
    switch (node.nodeType) {
      case 'chatgpt':
        return await this.processChatGPTNode(node, userMessage, context);
      case 'message':
        return await this.processMessageNode(node, userMessage, context);
      case 'condition':
        return await this.processConditionNode(node, userMessage, context);
      case 'action':
        return await this.processActionNode(node, userMessage, context);
      default:
        throw new Error(`Tipo de nó não suportado: ${node.nodeType}`);
    }
  }

  /**
   * Processa nó do tipo ChatGPT
   */
  private async processChatGPTNode(node: any, userMessage: string, context: FlowExecutionContext) {
    if (!node.chatgptProfile) {
      throw new Error('Perfil ChatGPT não configurado no nó');
    }

    const response = await this.chatgptService.sendMessage(
      node.chatgptProfile.id,
      userMessage,
      context.conversationHistory
    );

    return {
      response: response.content,
      updatedVariables: context.variables
    };
  }

  /**
   * Processa nó do tipo mensagem
   */
  private async processMessageNode(node: any, userMessage: string, context: FlowExecutionContext) {
    const config = node.config as FlowNodeConfig;
    return {
      response: config.message || 'Mensagem não configurada',
      updatedVariables: context.variables
    };
  }

  /**
   * Processa nó do tipo condição
   */
  private async processConditionNode(node: any, userMessage: string, context: FlowExecutionContext) {
    const config = node.config as FlowNodeConfig;
    
    // Aqui você pode implementar lógica de validação específica
    // Por exemplo, validação de marca de TV
    if (config.condition === 'tv_brand_validation') {
      return await this.validateTVBrand(userMessage, context);
    }

    return {
      response: 'Condição processada',
      updatedVariables: context.variables
    };
  }

  /**
   * Processa nó do tipo ação
   */
  private async processActionNode(node: any, userMessage: string, context: FlowExecutionContext) {
    const config = node.config as FlowNodeConfig;
    
    // Aqui você pode implementar ações específicas
    // Por exemplo, consulta no sistema IPTV
    if (config.action === 'iptv_consultation') {
      return await this.processIPTVConsultation(userMessage, context);
    }

    return {
      response: 'Ação executada',
      updatedVariables: context.variables
    };
  }

  /**
   * Valida marca de TV
   */
  private async validateTVBrand(userMessage: string, context: FlowExecutionContext) {
    const tvBrands = await this.prisma.tVBrand.findMany({
      where: { isActive: true }
    });

    const message = userMessage.toLowerCase().trim();
    
    for (const brand of tvBrands) {
      if (brand.aliases.some(alias => alias.toLowerCase() === message)) {
        return {
          response: `Perfeito! Você tem uma TV ${brand.name}. Vou te ajudar com as instruções específicas.`,
          updatedVariables: {
            ...context.variables,
            selectedTVBrand: brand.name,
            tvBrandId: brand.id
          }
        };
      }
    }

    return {
      response: 'Por favor, diga apenas o nome da marca da sua TV (LG, Samsung, Roku, Xiaomi, etc.)',
      updatedVariables: context.variables
    };
  }

  /**
   * Processa consulta no sistema IPTV
   */
  private async processIPTVConsultation(userMessage: string, context: FlowExecutionContext) {
    // Aqui você implementaria a consulta real no sistema IPTV
    // Por enquanto, vamos simular
    
    const phoneNumber = context.phoneNumber;
    
    // Simula consulta no sistema IPTV
    const hasUsedTest = Math.random() > 0.5; // Simulação
    
    if (hasUsedTest) {
      return {
        response: 'Você já utilizou o teste gratuito anteriormente. Entre em contato conosco para conhecer nossos planos!',
        updatedVariables: {
          ...context.variables,
          iptvTestUsed: true
        }
      };
    } else {
      return {
        response: 'Perfeito! Você pode fazer o teste gratuito. Vou gerar suas credenciais agora...',
        updatedVariables: {
          ...context.variables,
          iptvTestUsed: false,
          canGenerateTest: true
        }
      };
    }
  }

  /**
   * Determina o próximo nó baseado nas conexões e condições
   */
  private async getNextNode(currentNode: any, userMessage: string, context: FlowExecutionContext) {
    const connections = currentNode.connections;
    
    if (!connections || connections.length === 0) {
      return null; // Fim do fluxo
    }

    // Se há apenas uma conexão sem condição, vai para ela
    if (connections.length === 1 && !connections[0].condition) {
      return connections[0].toNode;
    }

    // Procura por conexão com condição que corresponde à resposta
    for (const connection of connections) {
      if (connection.condition) {
        const message = userMessage.toLowerCase().trim();
        const condition = connection.condition.toLowerCase();
        
        if (message.includes(condition)) {
          return connection.toNode;
        }
      }
    }

    // Se não encontrou condição específica, vai para a primeira conexão sem condição
    const defaultConnection = connections.find(c => !c.condition);
    return defaultConnection?.toNode || null;
  }

  /**
   * Cria fluxo padrão de identificação de TV
   */
  async createDefaultTVFlow() {
    const flow = await this.createFlow({
      name: 'Identificação de TV',
      description: 'Fluxo para identificar marca de TV e direcionar para instruções específicas'
    });

    // Nó inicial - pergunta sobre a TV
    const startNode = await this.createFlowNode({
      flowId: flow.id,
      name: 'Pergunta sobre TV',
      description: 'Pergunta qual marca de TV o cliente possui',
      nodeType: 'message',
      position: { x: 100, y: 100 },
      config: {
        message: 'Olá! Para te ajudar melhor, me diga qual marca de TV você possui? (LG, Samsung, Roku, Xiaomi, etc.)'
      }
    });

    // Nó de validação
    const validationNode = await this.createFlowNode({
      flowId: flow.id,
      name: 'Validação de Marca',
      description: 'Valida se a marca informada é válida',
      nodeType: 'condition',
      position: { x: 100, y: 200 },
      config: {
        condition: 'tv_brand_validation'
      }
    });

    // Conecta os nós
    await this.connectNodes({
      fromNodeId: startNode.id,
      toNodeId: validationNode.id
    });

    this.logger.log(`Created default TV flow: ${flow.id}`);
    return flow;
  }
}