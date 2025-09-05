// Sistema de monitoramento de performance
import React from 'react'

export interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: any
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    this.setupPerformanceObserver()
  }

  private setupPerformanceObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Observar métricas de navegação
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('navigation', {
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            metadata: {
              type: entry.entryType,
              size: (entry as any).transferSize || 0
            }
          })
        }
      })
      navObserver.observe({ entryTypes: ['navigation'] })

      // Observar métricas de recursos
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('resource', {
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            metadata: {
              type: entry.entryType,
              size: (entry as any).transferSize || 0,
              initiatorType: (entry as any).initiatorType
            }
          })
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })

      this.observers.push(navObserver, resourceObserver)
    }
  }

  public startTiming(name: string, metadata?: any): string {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.metrics.set(id, {
      name,
      startTime: performance.now(),
      metadata
    })
    return id
  }

  public endTiming(id: string): PerformanceMetric | null {
    const metric = this.metrics.get(id)
    if (!metric) return null

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    // Log métrica lenta
    if (metric.duration > 1000) {
      console.warn(`Métrica lenta detectada: ${metric.name} levou ${metric.duration.toFixed(2)}ms`)
    }

    return metric
  }

  public recordMetric(name: string, metric: Omit<PerformanceMetric, 'name'>) {
    const fullMetric: PerformanceMetric = {
      name,
      ...metric
    }
    
    // Log métrica lenta
    if (metric.duration && metric.duration > 1000) {
      console.warn(`Métrica lenta detectada: ${name} levou ${metric.duration.toFixed(2)}ms`)
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  public getSlowMetrics(threshold: number = 1000): PerformanceMetric[] {
    return this.getMetrics().filter(metric => 
      metric.duration && metric.duration > threshold
    )
  }

  public clearMetrics() {
    this.metrics.clear()
  }

  public getPageLoadTime(): number | null {
    if (typeof window === 'undefined') return null
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigation ? navigation.loadEventEnd - navigation.loadEventStart : null
  }

  public getFirstContentfulPaint(): number | null {
    if (typeof window === 'undefined') return null
    
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcp ? fcp.startTime : null
  }

  public getLargestContentfulPaint(): number | null {
    if (typeof window === 'undefined') return null
    
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
    const lcp = lcpEntries[lcpEntries.length - 1]
    return lcp ? lcp.startTime : null
  }

  public getCumulativeLayoutShift(): number | null {
    if (typeof window === 'undefined') return null
    
    const clsEntries = performance.getEntriesByType('layout-shift')
    return clsEntries.reduce((cls, entry) => {
      return cls + (entry as any).value
    }, 0)
  }

  public getPerformanceReport() {
    return {
      pageLoadTime: this.getPageLoadTime(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      largestContentfulPaint: this.getLargestContentfulPaint(),
      cumulativeLayoutShift: this.getCumulativeLayoutShift(),
      slowMetrics: this.getSlowMetrics(),
      allMetrics: this.getMetrics()
    }
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Instância global
export const performanceMonitor = new PerformanceMonitor()

// Hook para usar monitoramento de performance
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<PerformanceMetric[]>([])

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics())
    }

    // Atualizar métricas a cada 5 segundos
    const interval = setInterval(updateMetrics, 5000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    metrics,
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    endTiming: performanceMonitor.endTiming.bind(performanceMonitor),
    getReport: performanceMonitor.getPerformanceReport.bind(performanceMonitor)
  }
}

// Hook para medir performance de componentes
export function useComponentPerformance(componentName: string) {
  const [timingId, setTimingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const id = performanceMonitor.startTiming(`component_${componentName}`)
    setTimingId(id)

    return () => {
      if (timingId) {
        performanceMonitor.endTiming(timingId)
      }
    }
  }, [componentName])

  return {
    startTiming: () => performanceMonitor.startTiming(`component_${componentName}`),
    endTiming: (id: string) => performanceMonitor.endTiming(id)
  }
}
