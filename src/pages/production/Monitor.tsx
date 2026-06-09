import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Activity, Target, Layers, Gem } from 'lucide-react';
import { useAppStore } from '@/store';

const statusMap: Record<string, { label: string; cls: string }> = {
  active: { label: '运行中', cls: 'bg-mine-green/20 text-mine-green' },
  idle: { label: '空闲', cls: 'bg-mine-amber/20 text-mine-amber' },
  maintenance: { label: '维护中', cls: 'bg-mine-red/20 text-mine-red' },
};

const gradeColor = (g: number) => (g >= 0.8 ? 'text-mine-green' : g >= 0.6 ? 'text-mine-amber' : 'text-mine-red');

export default function Monitor() {
  const miningFaces = useAppStore(s => s.miningFaces);
  const totalOutput = miningFaces.reduce((s, f) => s + f.currentOutput, 0);
  const completionRate = Math.round(
    (miningFaces.reduce((s, f) => s + f.currentOutput, 0) / miningFaces.reduce((s, f) => s + f.dailyTarget, 0)) * 100
  );
  const onlineCount = miningFaces.filter((f) => f.status === 'active').length;
  const avgGrade = +(miningFaces.reduce((s, f) => s + f.oreGrade, 0) / miningFaces.length).toFixed(2);

  const stats = [
    { icon: Activity, label: '总产量', value: `${totalOutput}`, unit: '吨', color: 'text-mine-cyan' },
    { icon: Target, label: '日目标完成率', value: `${completionRate}`, unit: '%', color: 'text-mine-amber' },
    { icon: Layers, label: '在线采掘面', value: `${onlineCount}`, unit: `/${miningFaces.length}`, color: 'text-mine-green' },
    { icon: Gem, label: '平均品位', value: `${avgGrade}`, unit: '', color: 'text-mine-blue' },
  ];

  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' as const, backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' } },
    grid: { left: 60, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: 'category' as const,
      data: miningFaces.map((f) => f.name),
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
    },
    yAxis: {
      type: 'value' as const,
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
      splitLine: { lineStyle: { color: '#1A2A42' } },
    },
    series: [
      {
        name: '当前产量',
        type: 'bar' as const,
        data: miningFaces.map((f) => f.currentOutput),
        itemStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00F0FF' }, { offset: 1, color: '#00B8C4' }] }, borderRadius: [4, 4, 0, 0] },
        barWidth: 24,
      },
      {
        name: '日目标',
        type: 'bar' as const,
        data: miningFaces.map((f) => f.dailyTarget),
        itemStyle: { color: 'rgba(74,123,204,0.3)', borderRadius: [4, 4, 0, 0] },
        barWidth: 24,
      },
    ],
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="mine-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-mine-bg ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-value ${s.color}`}>
                {s.value}
                <span className="text-sm text-mine-muted ml-1">{s.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {miningFaces.map((face) => {
          const pct = Math.round((face.currentOutput / face.dailyTarget) * 100);
          const st = statusMap[face.status];
          return (
            <div key={face.id} className="mine-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-mine-text font-medium">{face.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${face.type === 'coal' ? 'bg-mine-blue/20 text-mine-blue' : 'bg-mine-amber/20 text-mine-amber'}`}>
                    {face.type === 'coal' ? '煤矿' : '金属矿'}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${st.cls}`}>{st.label}</span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-mine-muted mb-1">
                  <span>{face.currentOutput} / {face.dailyTarget} {face.unit}</span>
                  <span className={pct >= 80 ? 'text-mine-green' : pct >= 50 ? 'text-mine-amber' : 'text-mine-red'}>{pct}%</span>
                </div>
                <div className="h-2 bg-mine-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      background: pct >= 80 ? '#00D68F' : pct >= 50 ? '#FFB800' : '#FF3B3B',
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-mine-muted">矿石品位:</span>
                <span className={`font-din font-bold ${gradeColor(face.oreGrade)}`}>{(face.oreGrade * 100).toFixed(0)}%</span>
                <div className="flex gap-0.5 ml-auto">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-3 rounded-sm ${face.oreGrade * 5 > i ? gradeColor(face.oreGrade).replace('text-', 'bg-') : 'bg-mine-border'}`} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mine-card">
        <h3 className="text-mine-text font-medium mb-2">采掘面产量对比</h3>
        <ReactECharts option={chartOption} style={{ height: 260 }} />
      </div>
    </div>
  );
}
