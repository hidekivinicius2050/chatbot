import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { cn } from '@/lib/utils'

interface DashboardCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
    period: string
  }
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger'
  trend?: 'up' | 'down' | 'stable'
  className?: string
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  icon,
  variant = 'default',
  trend = 'stable',
  className
}) => {
  const variantStyles = {
    default: 'border-blue-500/30 hover:border-blue-500/50',
    success: 'border-green-500/30 hover:border-green-500/50',
    warning: 'border-yellow-500/30 hover:border-yellow-500/50',
    info: 'border-blue-400/30 hover:border-blue-400/50',
    danger: 'border-red-500/30 hover:border-red-500/50'
  }

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-gray-400'
  }

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    stable: '→'
  }

  return (
    <Card 
      variant="elevated" 
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        variantStyles[variant],
        className
      )}
    >
      {/* Gradient Overlay */}
      <div className={cn(
        'absolute inset-0 opacity-5 transition-opacity duration-300',
        variant === 'default' && 'bg-gradient-to-br from-blue-500 to-blue-600',
        variant === 'success' && 'bg-gradient-to-br from-green-500 to-green-600',
        variant === 'warning' && 'bg-gradient-to-br from-yellow-500 to-yellow-600',
        variant === 'info' && 'bg-gradient-to-br from-blue-400 to-blue-500',
        variant === 'danger' && 'bg-gradient-to-br from-red-500 to-red-600'
      )} />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-300">
            {title}
          </CardTitle>
          {icon && (
            <div className="text-2xl opacity-80">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold text-white mb-2">
              {value}
            </div>
            
            {change && (
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-sm font-medium',
                  change.isPositive ? 'text-green-400' : 'text-red-400'
                )}>
                  {change.isPositive ? '+' : ''}{change.value}%
                </span>
                <span className="text-xs text-gray-400">
                  vs {change.period}
                </span>
              </div>
            )}
          </div>
          
          {trend !== 'stable' && (
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trendColors[trend]
            )}>
              <span className="text-lg">{trendIcons[trend]}</span>
              <span className="capitalize">{trend}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  )
}

// Specialized Dashboard Cards
export const MetricCard: React.FC<Omit<DashboardCardProps, 'variant'> & { metric: string }> = ({
  metric,
  ...props
}) => (
  <DashboardCard
    {...props}
    variant="default"
    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50"
  />
)

export const RevenueCard: React.FC<Omit<DashboardCardProps, 'variant'>> = (props) => (
  <DashboardCard
    {...props}
    variant="success"
    icon="💰"
    className="bg-gradient-to-br from-green-900/20 to-green-800/20"
  />
)

export const UsersCard: React.FC<Omit<DashboardCardProps, 'variant'>> = (props) => (
  <DashboardCard
    {...props}
    variant="info"
    icon="👥"
    className="bg-gradient-to-br from-blue-900/20 to-blue-800/20"
  />
)

export const AlertCard: React.FC<Omit<DashboardCardProps, 'variant'>> = (props) => (
  <DashboardCard
    {...props}
    variant="warning"
    icon="⚠️"
    className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20"
  />
)




