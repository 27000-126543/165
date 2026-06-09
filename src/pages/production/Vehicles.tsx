import { useState } from 'react';
import { Truck, MapPin, User, Weight, Route, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store';

const statusCfg: Record<string, { label: string; cls: string; dot: string }> = {
  running: { label: '运行中', cls: 'text-mine-green', dot: 'bg-mine-green' },
  idle: { label: '空闲', cls: 'text-mine-amber', dot: 'bg-mine-amber' },
  maintenance: { label: '维修中', cls: 'text-mine-red', dot: 'bg-mine-red' },
};

const typeLabels: Record<string, string> = { shovel: '铲运车', transport: '运输车', auxiliary: '辅助车' };

function polyline(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
}

export default function Vehicles() {
  const vehicles = useAppStore(s => s.vehicles);
  const [selected, setSelected] = useState<string | null>(null);

  const running = vehicles.filter((v) => v.status === 'running').length;
  const idle = vehicles.filter((v) => v.status === 'idle').length;
  const maint = vehicles.filter((v) => v.status === 'maintenance').length;

  const sel = vehicles.find((v) => v.id === selected);

  const totalEmptyDist = vehicles.reduce((s, v) => {
    const rLen = v.route.reduce((a, p, i) => i === 0 ? 0 : a + Math.hypot(p.x - v.route[i - 1].x, p.y - v.route[i - 1].y), 0);
    const oLen = v.optimizedRoute.reduce((a, p, i) => i === 0 ? 0 : a + Math.hypot(p.x - v.optimizedRoute[i - 1].x, p.y - v.optimizedRoute[i - 1].y), 0);
    return s + (rLen - oLen);
  }, 0);
  const totalOrigLen = vehicles.reduce((s, v) => v.route.reduce((a, p, i) => i === 0 ? 0 : a + Math.hypot(p.x - v.route[i - 1].x, p.y - v.route[i - 1].y), 0), 0);
  const emptyRate = totalOrigLen > 0 ? Math.round((totalEmptyDist / totalOrigLen) * 100) : 0;

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Truck, label: '运行中', value: running, color: 'text-mine-green' },
          { icon: Route, label: '空闲', value: idle, color: 'text-mine-amber' },
          { icon: Truck, label: '维修中', value: maint, color: 'text-mine-red' },
        ].map((s) => (
          <div key={s.label} className="mine-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-mine-bg ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-value ${s.color}`}>{s.value}<span className="text-sm text-mine-muted ml-1">辆</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 mine-card">
          <h3 className="text-mine-text font-medium mb-2">矿区地图 · 车辆调度</h3>
          <svg viewBox="0 0 700 500" className="w-full h-auto">
            <rect x="0" y="0" width="700" height="500" fill="#0A1628" rx="8" />
            <rect x="50" y="40" width="600" height="420" fill="none" stroke="#243352" strokeWidth="1" strokeDasharray="4" rx="4" />
            <line x1="100" y1="100" x2="600" y2="100" stroke="#1A2A42" strokeWidth="2" />
            <line x1="100" y1="200" x2="600" y2="200" stroke="#1A2A42" strokeWidth="2" />
            <line x1="100" y1="300" x2="600" y2="300" stroke="#1A2A42" strokeWidth="2" />
            <line x1="100" y1="400" x2="600" y2="400" stroke="#1A2A42" strokeWidth="2" />
            <line x1="200" y1="50" x2="200" y2="450" stroke="#1A2A42" strokeWidth="2" />
            <line x1="350" y1="50" x2="350" y2="450" stroke="#1A2A42" strokeWidth="2" />
            <line x1="500" y1="50" x2="500" y2="450" stroke="#1A2A42" strokeWidth="2" />
            <text x="60" y="55" fill="#7A8BA0" fontSize="11">A区</text>
            <text x="60" y="155" fill="#7A8BA0" fontSize="11">B区</text>
            <text x="60" y="255" fill="#7A8BA0" fontSize="11">C区</text>
            <text x="60" y="355" fill="#7A8BA0" fontSize="11">D区</text>
            <rect x="550" y="60" width="80" height="40" fill="#1A2A42" stroke="#243352" rx="4" />
            <text x="570" y="85" fill="#00F0FF" fontSize="10">出口</text>
            <rect x="70" y="380" width="80" height="40" fill="#1A2A42" stroke="#243352" rx="4" />
            <text x="85" y="405" fill="#FFB800" fontSize="10">装载站</text>
            {vehicles.map((v) =>
              v.route.length > 1 ? (
                <path key={`r-${v.id}`} d={polyline(v.route)} fill="none" stroke="#7A8BA0" strokeWidth="2" strokeDasharray="6 4" opacity={0.5} />
              ) : null
            )}
            {vehicles.map((v) =>
              v.optimizedRoute.length > 1 ? (
                <path key={`o-${v.id}`} d={polyline(v.optimizedRoute)} fill="none" stroke="#00F0FF" strokeWidth="2.5" opacity={0.8} />
              ) : null
            )}
            {vehicles.map((v) => {
              const c = v.status === 'running' ? '#00D68F' : v.status === 'idle' ? '#FFB800' : '#FF3B3B';
              return (
                <g key={v.id} onClick={() => setSelected(v.id)} className="cursor-pointer">
                  <circle cx={v.position.x} cy={v.position.y} r="14" fill={c} opacity={0.2} />
                  <circle cx={v.position.x} cy={v.position.y} r="7" fill={c} stroke="#0A1628" strokeWidth="2" />
                  <text x={v.position.x} y={v.position.y + 22} fill="#E0E8F0" fontSize="9" textAnchor="middle">{v.plateNumber}</text>
                  {selected === v.id && <circle cx={v.position.x} cy={v.position.y} r="20" fill="none" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="3 2" className="animate-pulse" />}
                </g>
              );
            })}
          </svg>
          <div className="flex items-center gap-6 mt-2 text-xs text-mine-muted">
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-mine-muted inline-block border-dashed" style={{ borderTop: '2px dashed #7A8BA0' }} /> 原路线</span>
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-mine-cyan inline-block" /> 优化路线</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-mine-green inline-block" /> 运行</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-mine-amber inline-block" /> 空闲</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-mine-red inline-block" /> 维修</span>
          </div>
        </div>

        <div className="col-span-2 mine-card overflow-auto max-h-[440px]">
          <h3 className="text-mine-text font-medium mb-2">车辆列表</h3>
          <div className="space-y-2">
            {vehicles.map((v) => {
              const sc = statusCfg[v.status];
              return (
                <div
                  key={v.id}
                  onClick={() => setSelected(v.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${selected === v.id ? 'border-mine-cyan bg-mine-cyan/5' : 'border-mine-border bg-mine-bg hover:border-mine-cyan/50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-mine-text font-medium text-sm">{v.plateNumber}</span>
                    <span className={`flex items-center gap-1 text-xs ${sc.cls}`}><span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-mine-muted">
                    <span className="flex items-center gap-1"><Truck size={12} />{typeLabels[v.type]}</span>
                    <span className="flex items-center gap-1"><User size={12} />{v.driver}</span>
                    <span className="flex items-center gap-1"><Weight size={12} />{v.currentLoad}/{v.loadCapacity}吨</span>
                    <span className="flex items-center gap-1"><MapPin size={12} />({v.position.x}, {v.position.y})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {sel && sel.route.length > 1 ? (
          <>
            <div className="mine-card">
              <div className="stat-label mb-1">原路线距离</div>
              <div className="stat-value text-mine-muted">
                {Math.round(sel.route.reduce((a, p, i) => i === 0 ? 0 : a + Math.hypot(p.x - sel.route[i - 1].x, p.y - sel.route[i - 1].y), 0))}
                <span className="text-sm text-mine-muted ml-1">m</span>
              </div>
            </div>
            <div className="mine-card">
              <div className="stat-label mb-1">优化路线距离</div>
              <div className="stat-value text-mine-cyan">
                {Math.round(sel.optimizedRoute.reduce((a, p, i) => i === 0 ? 0 : a + Math.hypot(p.x - sel.optimizedRoute[i - 1].x, p.y - sel.optimizedRoute[i - 1].y), 0))}
                <span className="text-sm text-mine-muted ml-1">m</span>
              </div>
            </div>
            <div className="mine-card">
              <div className="stat-label mb-1">节省距离</div>
              <div className="stat-value text-mine-green">
                {Math.round(sel.route.reduce((a, p, i) => i === 0 ? 0 : a + Math.hypot(p.x - sel.route[i - 1].x, p.y - sel.route[i - 1].y), 0) - sel.optimizedRoute.reduce((a, p, i) => i === 0 ? 0 : a + Math.hypot(p.x - sel.optimizedRoute[i - 1].x, p.y - sel.optimizedRoute[i - 1].y), 0))}
                <span className="text-sm text-mine-muted ml-1">m</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mine-card">
              <div className="stat-label mb-1">总运行车辆</div>
              <div className="stat-value text-mine-green">{running}<span className="text-sm text-mine-muted ml-1">辆</span></div>
            </div>
            <div className="mine-card">
              <div className="stat-label mb-1">空驶率</div>
              <div className="stat-value text-mine-amber">{emptyRate}<span className="text-sm text-mine-muted ml-1">%</span></div>
            </div>
            <div className="mine-card">
              <div className="stat-label mb-1">平均装载率</div>
              <div className="stat-value text-mine-cyan">
                {vehicles.filter((v) => v.status === 'running').length > 0
                  ? Math.round((vehicles.filter((v) => v.status === 'running').reduce((s, v) => s + v.currentLoad / v.loadCapacity, 0) / vehicles.filter((v) => v.status === 'running').length) * 100)
                  : 0}
                <span className="text-sm text-mine-muted ml-1">%</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
