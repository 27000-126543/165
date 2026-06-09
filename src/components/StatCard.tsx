import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  color: 'cyan' | 'green' | 'blue' | 'red'
  trend?: string
}

const colorMap = {
  cyan: { bg: 'bg-mine-cyan/10', text: 'text-mine-cyan' },
  green: { bg: 'bg-mine-green/10', text: 'text-mine-green' },
  blue: { bg: 'bg-mine-blue/10', text: 'text-mine-blue' },
  red: { bg: 'bg-mine-red/10', text: 'text-mine-red' },
}

export default function StatCard({ icon: Icon, value, label, color, trend }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className="mine-card flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', c.bg)}>
        <Icon className={cn('w-6 h-6', c.text)} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="stat-value text-mine-text">{value}</span>
          {trend && (
            <span className={cn('text-xs font-medium', trend.startsWith('+') ? 'text-mine-green' : 'text-mine-red')}>
              {trend}
            </span>
          )}
        </div>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  )
}
