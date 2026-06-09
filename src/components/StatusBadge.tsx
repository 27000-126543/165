import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'approved' | 'rejected' | 'pending'
}

const statusConfig = {
  approved: { label: '已通过', className: 'bg-mine-green/20 text-mine-green border-mine-green/30' },
  rejected: { label: '已拒绝', className: 'bg-mine-red/20 text-mine-red border-mine-red/30' },
  pending: { label: '待审核', className: 'bg-mine-amber/20 text-mine-amber border-mine-amber/30' },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full border', config.className)}>
      {config.label}
    </span>
  )
}
