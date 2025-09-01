import { IsString, IsBoolean, IsObject, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AutomationTrigger {
  @ApiProperty({ example: 'inbound.message', description: 'Tipo do trigger' })
  @IsString()
  type: string;

  @ApiProperty({ required: false, description: 'Filtros do trigger' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

export class AutomationCondition {
  @ApiProperty({ description: 'Condição a ser avaliada' })
  @IsObject()
  if: Record<string, any>;
}

export class AutomationAction {
  @ApiProperty({ example: 'send.autoReply', description: 'Tipo da ação' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Parâmetros da ação' })
  @IsObject()
  params: Record<string, any>;
}

export class AutomationEdge {
  @ApiProperty({ description: 'Condição para seguir este edge' })
  @IsObject()
  condition: Record<string, any>;

  @ApiProperty({ description: 'Próximo conjunto de ações' })
  @IsArray()
  actions: AutomationAction[];
}

export class AutomationDsl {
  @ApiProperty({ description: 'Triggers da automação' })
  @IsArray()
  triggers: AutomationTrigger[];

  @ApiProperty({ description: 'Condições da automação' })
  @IsArray()
  conditions: AutomationCondition[];

  @ApiProperty({ description: 'Ações da automação' })
  @IsArray()
  actions: AutomationAction[];

  @ApiProperty({ required: false, description: 'Edges para fluxo condicional' })
  @IsOptional()
  @IsArray()
  edges?: AutomationEdge[];

  [key: string]: any;
}

export class CreateAutomationDto {
  @ApiProperty({ example: 'Boas-vindas', description: 'Nome da automação' })
  @IsString()
  name: string;

  @ApiProperty({ example: true, description: 'Se a automação está ativa' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'DSL da automação' })
  @IsObject()
  dsl: AutomationDsl;
}

export class UpdateAutomationDto {
  @ApiProperty({ required: false, example: 'Boas-vindas', description: 'Nome da automação' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: true, description: 'Se a automação está ativa' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ required: false, description: 'DSL da automação' })
  @IsOptional()
  @IsObject()
  dsl?: AutomationDsl;
}

export class TestAutomationDto {
  @ApiProperty({ description: 'Evento mock para teste' })
  @IsObject()
  eventMock: Record<string, any>;
}

export class QueryAutomationsDto {
  @ApiProperty({ required: false, description: 'Filtrar por status ativo' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ required: false, description: 'Cursor para paginação' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ required: false, example: 20, description: 'Limite de resultados' })
  @IsOptional()
  limit?: number;
}
