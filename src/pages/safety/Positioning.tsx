import { MapPin, Clock, AlertTriangle } from 'lucide-react'
import MineMap from '@/components/MineMap'
import { useAppStore } from '@/store'

const levelLabel: Record<string, string> = {
  critical: '高危',
  restricted: '受限',
  warning: '警告',
}

const levelColor: Record<string, string> = {
  critical: 'bg-mine-red',
  restricted: 'bg-mine-amber',
  warning: 'bg-mine-amber',
}

export default function Positioning() {
  const miners = useAppStore(s => s.miners)
  const dangerZones = useAppStore(s => s.dangerZones)
  const vehicles = useAppStore(s => s.vehicles)
  const undergroundMiners = miners.filter(m => m.isUnderground && m.currentPosition)

  const minerPositions = undergroundMiners.map(m => ({
    x: m.currentPosition!.x,
    y: m.currentPosition!.y,
    name: m.name,
    zone: m.currentPosition!.zone,
  }))

  const vehiclePositions = vehicles.filter(v => v.status === 'running').map(v => ({
    x: v.position.x,
    y: v.position.y,
    id: v.id,
    plateNumber: v.plateNumber,
  }))

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 mine-card">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-mine-cyan" />
            <span className="text-mine-text font-medium text-sm">井下人员定位图</span>
            <span className="ml-auto text-mine-muted text-xs">实时在线 {undergroundMiners.length} 人</span>
          </div>
          <div className="h-[420px]">
            <MineMap miners={minerPositions} dangerZones={dangerZones} vehicles={vehiclePositions} />
          </div>
        </div>

        <div className="mine-card flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-mine-cyan" />
            <span className="text-mine-text font-medium text-sm">井下人员列表</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {undergroundMiners.map(miner => (
              <div key={miner.id} className="flex items-center gap-3 p-2 rounded-lg bg-mine-bg/50 hover:bg-mine-border/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-mine-cyan/20 flex items-center justify-center">
                  <span className="text-mine-cyan text-xs font-medium">{miner.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-mine-text text-sm">{miner.name}</div>
                  <div className="text-mine-muted text-xs">{miner.currentPosition?.zone}</div>
                </div>
                <div className="text-mine-muted text-xs">06:00入井</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mine-card">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-mine-amber" />
          <span className="text-mine-text font-medium text-sm">危险区域图例</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {dangerZones.map(zone => (
            <div key={zone.id} className="flex items-center gap-3 p-2 rounded-lg bg-mine-bg/50">
              <div className={`w-3 h-3 rounded-sm ${levelColor[zone.level]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-mine-text text-sm">{zone.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${levelColor[zone.level]}/20 ${zone.level === 'critical' ? 'text-mine-red' : 'text-mine-amber'}`}>
                    {levelLabel[zone.level]}
                  </span>
                </div>
                <div className="text-mine-muted text-xs">{zone.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
