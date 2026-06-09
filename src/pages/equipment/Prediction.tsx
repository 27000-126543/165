import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Shield, Clock, Activity, Thermometer, AlertTriangle, ChevronDown } from 'lucide-react';
import { equipmentList, inspectionRecords } from '@/data/equipment';

function generateForecast(health: number) {
  const probs: { day: number; prob: number }[] = [];
  let base = (100 - health) / 100 * 0.05;
  for (let d = 1; d <= 30; d++) {
    const p = Math.min(base + d * 0.008 * (1 - health / 100), 0.95);
    probs.push({ day: d, prob: Math.round(p * 100) / 100 });
  }
  return probs;
}

function getRiskLevel(hs: number) {
  if (hs > 80) return { level: '低风险', color: 'text-mine-green', bg: 'bg-mine-green/10 border-mine-green/30', rec: '设备运行正常，建议保持定期巡检频率' };
  if (hs > 60) return { level: '中风险', color: 'text-mine-amber', bg: 'bg-mine-amber/10 border-mine-amber/30', rec: '设备部分指标偏离，建议加强监测并安排预防性维护' };
  if (hs > 40) return { level: '高风险', color: 'text-mine-red', bg: 'bg-mine-red/10 border-mine-red/30', rec: '设备多项指标异常，建议尽快安排检修并准备备件' };
  return { level: '极高风险', color: 'text-mine-red', bg: 'bg-mine-red/10 border-mine-red/30', rec: '设备随时可能故障，建议立即停机检修' };
}

export default function Prediction() {
  const [selectedId, setSelectedId] = useState(equipmentList[0].id);
  const eq = equipmentList.find((e) => e.id === selectedId)!;
  const eqRecords = inspectionRecords.filter((r) => r.equipmentId === selectedId);
  const risk = getRiskLevel(eq.healthScore);
  const forecast = useMemo(() => generateForecast(eq.healthScore), [eq.healthScore]);
  const estDays = Math.round(eq.remainingLife * 3.65);

  const gaugeOption = {
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge' as const,
      startAngle: 210,
      endAngle: -30,
      min: 0,
      max: 100,
      progress: { show: true, width: 14, itemStyle: { color: eq.healthScore > 70 ? '#00D68F' : eq.healthScore >= 40 ? '#FFB800' : '#FF3B3B' } },
      axisLine: { lineStyle: { width: 14, color: [[1, '#1A2A42']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      title: { show: false },
      detail: { valueAnimation: true, fontSize: 28, fontFamily: 'DIN Alternate, monospace', fontWeight: 'bold', color: eq.healthScore > 70 ? '#00D68F' : eq.healthScore >= 40 ? '#FFB800' : '#FF3B3B', offsetCenter: [0, '0%'] },
      data: [{ value: eq.healthScore }],
    }],
  };

  const vibOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' as const, backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' } },
    grid: { left: 45, right: 15, top: 20, bottom: 25 },
    xAxis: { type: 'category' as const, data: eqRecords.slice(-7).map((r) => r.timestamp.slice(5, 16)), axisLine: { lineStyle: { color: '#243352' } }, axisLabel: { color: '#7A8BA0', fontSize: 9 } },
    yAxis: { type: 'value' as const, axisLine: { lineStyle: { color: '#243352' } }, axisLabel: { color: '#7A8BA0' }, splitLine: { lineStyle: { color: '#1A2A42' } }, name: 'mm/s', nameTextStyle: { color: '#7A8BA0', fontSize: 9 } },
    series: [{ type: 'line' as const, data: eqRecords.slice(-7).map((r) => r.vibration), smooth: true, lineStyle: { color: '#00F0FF', width: 2 }, itemStyle: { color: '#00F0FF' }, areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,240,255,0.2)' }, { offset: 1, color: 'transparent' }] } }, markLine: { silent: true, lineStyle: { color: '#FF3B3B', type: 'dashed' as const }, data: [{ yAxis: 5 }], label: { color: '#FF3B3B', fontSize: 9 } } }],
  };

  const tempOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' as const, backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' } },
    grid: { left: 45, right: 15, top: 20, bottom: 25 },
    xAxis: { type: 'category' as const, data: eqRecords.slice(-7).map((r) => r.timestamp.slice(5, 16)), axisLine: { lineStyle: { color: '#243352' } }, axisLabel: { color: '#7A8BA0', fontSize: 9 } },
    yAxis: { type: 'value' as const, axisLine: { lineStyle: { color: '#243352' } }, axisLabel: { color: '#7A8BA0' }, splitLine: { lineStyle: { color: '#1A2A42' } }, name: '°C', nameTextStyle: { color: '#7A8BA0', fontSize: 9 } },
    series: [{ type: 'line' as const, data: eqRecords.slice(-7).map((r) => r.temperature), smooth: true, lineStyle: { color: '#FFB800', width: 2 }, itemStyle: { color: '#FFB800' }, areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,184,0,0.2)' }, { offset: 1, color: 'transparent' }] } }, markLine: { silent: true, lineStyle: { color: '#FF3B3B', type: 'dashed' as const }, data: [{ yAxis: 85 }], label: { color: '#FF3B3B', fontSize: 9 } } }],
  };

  const faultOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' as const, backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' }, formatter: (p: { axisValue: string; data: number }[]) => `第${p[0].axisValue}天<br/>故障概率: ${(p[0].data * 100).toFixed(1)}%` },
    grid: { left: 45, right: 15, top: 20, bottom: 25 },
    xAxis: { type: 'category' as const, data: forecast.map((f) => f.day), axisLine: { lineStyle: { color: '#243352' } }, axisLabel: { color: '#7A8BA0', fontSize: 9, interval: 4 }, name: '天', nameTextStyle: { color: '#7A8BA0', fontSize: 9 } },
    yAxis: { type: 'value' as const, max: 1, axisLine: { lineStyle: { color: '#243352' } }, axisLabel: { color: '#7A8BA0', formatter: (v: number) => `${(v * 100).toFixed(0)}%` }, splitLine: { lineStyle: { color: '#1A2A42' } } },
    series: [{ type: 'line' as const, data: forecast.map((f) => f.prob), smooth: true, lineStyle: { color: '#FF3B3B', width: 2 }, itemStyle: { color: '#FF3B3B' }, areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,59,59,0.25)' }, { offset: 1, color: 'transparent' }] } }, markLine: { silent: true, lineStyle: { color: '#FFB800', type: 'dashed' as const }, data: [{ yAxis: 0.5 }], label: { color: '#FFB800', fontSize: 9, formatter: '50%警戒线' } } }],
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-3">
        <label className="text-mine-muted text-sm">选择设备:</label>
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="bg-mine-bg border border-mine-border rounded-lg px-3 py-2 pr-8 text-sm text-mine-text focus:outline-none focus:border-mine-cyan/50 appearance-none"
          >
            {equipmentList.map((e) => (
              <option key={e.id} value={e.id}>{e.name} ({e.model}) - {e.location}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mine-muted pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="mine-card flex flex-col items-center justify-center">
          <h3 className="text-mine-muted text-xs mb-2">健康评分</h3>
          <ReactECharts option={gaugeOption} style={{ height: 160 }} />
          <span className={`text-xs mt-1 ${risk.color}`}>{risk.level}</span>
        </div>

        <div className="mine-card flex flex-col justify-center space-y-3">
          <h3 className="text-mine-muted text-xs">剩余寿命</h3>
          <div className="h-3 bg-mine-bg rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${eq.remainingLife}%`, backgroundColor: eq.remainingLife > 70 ? '#00D68F' : eq.remainingLife >= 40 ? '#FFB800' : '#FF3B3B' }}
            />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-din text-2xl font-bold text-mine-text">{eq.remainingLife}%</span>
            <span className="text-mine-muted text-xs">约 {estDays} 天</span>
          </div>
        </div>

        <div className="mine-card col-span-3 flex flex-col justify-center">
          <h3 className="text-mine-muted text-xs mb-2">风险评估</h3>
          <div className={`border rounded-lg p-4 ${risk.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className={risk.color} />
              <span className={`font-medium ${risk.color}`}>{risk.level}</span>
              <span className="text-mine-muted text-xs ml-auto">{eq.name} · {eq.location}</span>
            </div>
            <p className="text-mine-text text-sm">{risk.rec}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="mine-card">
          <h3 className="text-mine-text font-medium mb-1 flex items-center gap-1.5"><Activity size={14} className="text-mine-cyan" />振动趋势 (近7次)</h3>
          <ReactECharts option={vibOption} style={{ height: 200 }} />
        </div>
        <div className="mine-card">
          <h3 className="text-mine-text font-medium mb-1 flex items-center gap-1.5"><Thermometer size={14} className="text-mine-amber" />温度趋势 (近7次)</h3>
          <ReactECharts option={tempOption} style={{ height: 200 }} />
        </div>
      </div>

      <div className="mine-card">
        <h3 className="text-mine-text font-medium mb-1 flex items-center gap-1.5"><AlertTriangle size={14} className="text-mine-red" />未来30天故障概率预测</h3>
        <ReactECharts option={faultOption} style={{ height: 220 }} />
      </div>
    </div>
  );
}
