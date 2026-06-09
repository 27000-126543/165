import { useState } from 'react';
import { Cpu, Activity, AlertTriangle, XCircle, Wrench, Search, Eye } from 'lucide-react';
import { useAppStore } from '@/store';

type StatusFilter = 'all' | 'running' | 'idle' | 'warning' | 'fault' | 'maintenance';

const statusCfg: Record<string, { label: string; cls: string; dot: string }> = {
  running: { label: '运行', cls: 'text-mine-green', dot: 'bg-mine-green' },
  idle: { label: '空闲', cls: 'text-mine-amber', dot: 'bg-mine-amber' },
  warning: { label: '预警', cls: 'text-mine-amber', dot: 'bg-mine-amber' },
  fault: { label: '故障', cls: 'text-mine-red', dot: 'bg-mine-red' },
  maintenance: { label: '维修', cls: 'text-mine-blue', dot: 'bg-mine-blue' },
};

const filterItems: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'running', label: '运行' },
  { key: 'idle', label: '空闲' },
  { key: 'warning', label: '预警' },
  { key: 'fault', label: '故障' },
  { key: 'maintenance', label: '维修' },
];

function healthColor(score: number) {
  return score > 70 ? '#00D68F' : score >= 40 ? '#FFB800' : '#FF3B3B';
}

function healthTextColor(score: number) {
  return score > 70 ? 'text-mine-green' : score >= 40 ? 'text-mine-amber' : 'text-mine-red';
}

export default function EquipmentList() {
  const equipmentList = useAppStore(s => s.equipmentList);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = equipmentList
    .filter((e) => filter === 'all' || e.status === filter)
    .filter((e) => e.name.includes(search) || e.model.includes(search) || e.type.includes(search) || e.location.includes(search));

  const counts = {
    total: equipmentList.length,
    running: equipmentList.filter((e) => e.status === 'running').length,
    warning: equipmentList.filter((e) => e.status === 'warning').length,
    fault: equipmentList.filter((e) => e.status === 'fault').length,
    maintenance: equipmentList.filter((e) => e.status === 'maintenance').length,
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="grid grid-cols-5 gap-4">
        {[
          { icon: Cpu, label: '总设备数', value: counts.total, color: 'text-mine-cyan' },
          { icon: Activity, label: '运行中', value: counts.running, color: 'text-mine-green' },
          { icon: AlertTriangle, label: '预警', value: counts.warning, color: 'text-mine-amber' },
          { icon: XCircle, label: '故障', value: counts.fault, color: 'text-mine-red' },
          { icon: Wrench, label: '维修中', value: counts.maintenance, color: 'text-mine-blue' },
        ].map((s) => (
          <div key={s.label} className="mine-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-mine-bg ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-value ${s.color}`}>{s.value}<span className="text-sm text-mine-muted ml-1">台</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {filterItems.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === f.key ? 'bg-mine-cyan/20 text-mine-cyan border border-mine-cyan/40' : 'bg-mine-card text-mine-muted border border-mine-border hover:text-mine-text'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mine-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索设备名称/型号..."
            className="w-full bg-mine-bg border border-mine-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-mine-text placeholder:text-mine-muted focus:outline-none focus:border-mine-cyan/50"
          />
        </div>
      </div>

      <div className="mine-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mine-border">
              {['设备名称', '型号', '类型', '安装日期', '位置', '状态', '健康评分', '剩余寿命', '操作'].map((h) => (
                <th key={h} className="text-left text-mine-muted font-medium py-3 px-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((eq) => {
              const sc = statusCfg[eq.status];
              return (
                <tr key={eq.id} className="border-b border-mine-border/50 hover:bg-mine-bg/50 transition-colors">
                  <td className="py-3 px-3 text-mine-text font-medium whitespace-nowrap">{eq.name}</td>
                  <td className="py-3 px-3 text-mine-muted font-din whitespace-nowrap">{eq.model}</td>
                  <td className="py-3 px-3 text-mine-text whitespace-nowrap">{eq.type}</td>
                  <td className="py-3 px-3 text-mine-muted whitespace-nowrap">{eq.installDate}</td>
                  <td className="py-3 px-3 text-mine-text whitespace-nowrap">{eq.location}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${sc.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-mine-bg rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${eq.healthScore}%`, backgroundColor: healthColor(eq.healthScore) }} />
                      </div>
                      <span className={`font-din text-xs ${healthTextColor(eq.healthScore)}`}>{eq.healthScore}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-mine-bg rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${eq.remainingLife}%`, backgroundColor: healthColor(eq.remainingLife) }} />
                      </div>
                      <span className={`font-din text-xs ${healthTextColor(eq.remainingLife)}`}>{eq.remainingLife}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <button className="text-mine-cyan hover:text-mine-cyan/80 flex items-center gap-1 text-xs">
                      <Eye size={12} />详情
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-mine-muted">暂无匹配设备</div>
        )}
      </div>
    </div>
  );
}
