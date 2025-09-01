import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Gauge, Histogram, Counter } from 'prom-client';

@Injectable()
export class SlosService {
  private readonly logger = new Logger(SlosService.name);

  // SLO Targets (alvos)
  private readonly sloApiP50Ms: number;
  private readonly sloApiP95Ms: number;
  private readonly sloWsDeliveryP95Ms: number;
  private readonly sloQueueLagP95Ms: number;

  // Métricas Prometheus
  private readonly sloApiP50Gauge: Gauge<string>;
  private readonly sloApiP95Gauge: Gauge<string>;
  private readonly sloWsDeliveryP95Gauge: Gauge<string>;
  private readonly sloQueueLagGauge: Gauge<string>;
  private readonly sloComplianceGauge: Gauge<string>;

  // Métricas de performance
  private readonly httpRequestDuration: Histogram<string>;
  private readonly wsDeliveryDuration: Histogram<string>;
  private readonly queueLagDuration: Histogram<string>;
  private readonly errorRate5xx: Counter<string>;

  constructor(private configService: ConfigService) {
    // Carregar SLOs do env
    this.sloApiP50Ms = this.configService.get('SLO_API_P50_MS', 120);
    this.sloApiP95Ms = this.configService.get('SLO_API_P95_MS', 350);
    this.sloWsDeliveryP95Ms = this.configService.get('SLO_WS_DELIVERY_P95_MS', 1000);
    this.sloQueueLagP95Ms = this.configService.get('SLO_QUEUE_LAG_P95_MS', 1000);

    // Inicializar métricas Prometheus
    this.sloApiP50Gauge = new Gauge({
      name: 'slo_api_p50_ms_target',
      help: 'SLO target for API P50 response time (ms)',
      labelNames: ['endpoint'],
    });

    this.sloApiP95Gauge = new Gauge({
      name: 'slo_api_p95_ms_target',
      help: 'SLO target for API P95 response time (ms)',
      labelNames: ['endpoint'],
    });

    this.sloWsDeliveryP95Gauge = new Gauge({
      name: 'slo_ws_delivery_p95_ms_target',
      help: 'SLO target for WebSocket delivery P95 (ms)',
    });

    this.sloQueueLagGauge = new Gauge({
      name: 'slo_queue_lag_p95_ms_target',
      help: 'SLO target for queue lag P95 (ms)',
      labelNames: ['queue'],
    });

    this.sloComplianceGauge = new Gauge({
      name: 'slo_compliance_ratio',
      help: 'SLO compliance ratio (0.0 to 1.0)',
      labelNames: ['slo_name'],
    });

    // Métricas de performance
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_ms',
      help: 'HTTP request duration in milliseconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [10, 25, 50, 100, 200, 500, 1000, 2000, 5000],
    });

    this.wsDeliveryDuration = new Histogram({
      name: 'ws_delivery_duration_ms',
      help: 'WebSocket message delivery duration (ms)',
      labelNames: ['event_type'],
      buckets: [10, 25, 50, 100, 200, 500, 1000, 2000],
    });

    this.queueLagDuration = new Histogram({
      name: 'queue_lag_ms',
      help: 'Queue processing lag in milliseconds',
      labelNames: ['queue', 'job_type'],
      buckets: [10, 25, 50, 100, 200, 500, 1000, 2000, 5000],
    });

    this.errorRate5xx = new Counter({
      name: 'http_5xx_errors_total',
      help: 'Total count of 5xx HTTP errors',
      labelNames: ['route'],
    });

    // Definir valores dos SLOs
    this.setSloTargets();
  }

  private setSloTargets(): void {
    // API SLOs
    this.sloApiP50Gauge.set({ endpoint: 'all' }, this.sloApiP50Ms);
    this.sloApiP95Gauge.set({ endpoint: 'all' }, this.sloApiP95Ms);
    
    // WebSocket SLOs
    this.sloWsDeliveryP95Gauge.set(this.sloWsDeliveryP95Ms);
    
    // Queue SLOs
    this.sloQueueLagGauge.set({ queue: 'messages' }, this.sloQueueLagP95Ms);
    this.sloQueueLagGauge.set({ queue: 'campaigns' }, this.sloQueueLagP95Ms * 5); // 5s para campaigns
  }

  // Métricas de API
  recordHttpRequest(method: string, route: string, statusCode: number, durationMs: number): void {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(durationMs);

    // Registrar erro 5xx
    if (statusCode >= 500) {
      this.errorRate5xx.labels(route).inc();
    }
  }

  // Métricas de WebSocket
  recordWsDelivery(eventType: string, durationMs: number): void {
    this.wsDeliveryDuration
      .labels(eventType)
      .observe(durationMs);
  }

  // Métricas de Queue
  recordQueueLag(queue: string, jobType: string, lagMs: number): void {
    this.queueLagDuration
      .labels(queue, jobType)
      .observe(lagMs);
  }

  // Calcular compliance dos SLOs
  calculateCompliance(): void {
    // Esta função seria chamada periodicamente para calcular compliance
    // Por enquanto, vamos definir valores padrão
    this.sloComplianceGauge.set({ slo_name: 'api_p50' }, 0.95);
    this.sloComplianceGauge.set({ slo_name: 'api_p95' }, 0.92);
    this.sloComplianceGauge.set({ slo_name: 'ws_delivery' }, 0.98);
    this.sloComplianceGauge.set({ slo_name: 'queue_lag' }, 0.96);
  }

  // Getters para os SLOs
  getApiP50Target(): number {
    return this.sloApiP50Ms;
  }

  getApiP95Target(): number {
    return this.sloApiP95Ms;
  }

  getWsDeliveryP95Target(): number {
    return this.sloWsDeliveryP95Ms;
  }

  getQueueLagP95Target(): number {
    return this.sloQueueLagP95Ms;
  }
}
