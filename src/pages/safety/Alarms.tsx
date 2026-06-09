import { useState } from 'react'
import { Bell, MapPin, Clock, Radio, CheckCircle } from 'lucide-react'
import { alarmRecords } from '@/data/miners'

type TypeFilter = 'all' | 'danger_zone' | 'over_time' | 'distress'
type LevelFilter = 'all' | 'warning' | 'critical' | 'emergency'

const typeTabs: { key: TypeFilter; label: string; icon: typeof MapPin }[] = [
  { key: 'all', label: '全部', icon: Bell },
  { key: 'danger_zone', label: '危险区域', icon: MapPin },
  { key: 'over_time', label: '超时作业', icon: Clock },
  { key: 'distress', label: '紧急求救', icon: Radio },
]

const levelTabs: { key: LevelFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'warning', label: '警告' },
  { key: 'critical', label: '严重' },
  { key: 'emergency', label: '紧急' },
]

const levelBorder: Record<string, string> = {
  warning: 'border-l-mine-amber',
  critical: 'border-l-mine-red',
  emergency: 'border-l-mine-red',
}

const levelTag: Record<string, { label: string; className: string }> = {
  warning: { label: '警告', className: 'bg-mine-amber/20 text-mine-amber' },
  critical: { label: '严重', className: 'bg-mine-red/20 text-mine-red' },
  emergency: { label: '紧急', className: 'bg-mine-red/20 text-mine-red animate-pulse' },
}

export default function Alarms() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')

  const filtered = alarmRecords.filter(record => {
    if (typeFilter !== 'all' && record.type !== typeFilter) return false
    if (levelFilter !== 'all' && record.level !== levelFilter) return false
    return true
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-mine-card border border-mine-border rounded-lg p-1">
          {typeTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${typeFilter === tab.key ? 'bg-mine-cyan/20 text-mine-cyan' : 'text-mine-muted hover:text-mine-text'}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-mine-card border border-mine-border rounded-lg p-1">
          {levelTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setLevelFilter(tab.key)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${levelFilter === tab.key ? 'bg-mine-cyan/20 text-mine-cyan' : 'text-mine-muted hover:text-mine-text'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(record => {
          const tag = levelTag[record.level]
          return (
            <div
              key={record.id}
              className={`mine-card border-l-4 ${levelBorder[record.level]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-mine-text font-medium text-sm">{record.minerName}</span>
                    <span className="text-mine-muted text-xs">{record.zone}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${tag.className}`}>
                      {tag.label}
                    </span>
                  </div>
                  <p className="text-mine-muted text-sm mb-2">{record.message}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-mine-muted">{record.timestamp}</span>
                    <span className="text-mine-amber">救援指令: {record.rescueCommand}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {record.resolved ? (
                    <div className="flex items-center gap-1 text-mine-green">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">已解决</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-mine-red">
                      <span className="w-2 h-2 rounded-full bg-mine-red animate-pulse" />
                      <span className="text-xs">未解决</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-mine-muted text-sm">暂无报警记录</div>
        )}
      </div>
    </div>
  )
}
