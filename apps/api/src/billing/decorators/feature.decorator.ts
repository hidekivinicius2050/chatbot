import { SetMetadata } from '@nestjs/common';
import { EntitlementKey } from '../dto/billing.dto';

export const RequireFeature = (feature: EntitlementKey) => SetMetadata('feature', feature);
