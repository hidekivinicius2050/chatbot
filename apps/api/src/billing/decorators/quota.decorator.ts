import { SetMetadata } from '@nestjs/common';

interface QuotaConfig {
  key: 'messages.monthly' | 'campaigns.daily';
  increment?: number;
}

export const RequireQuota = (config: QuotaConfig) => SetMetadata('quota', config);
