import { useState } from 'react';
import { Activity, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { monitorPoints } from '@/data/environment';

const statusConfig = {
  normal: { label: '正常', color: 'text-mine-green', bg: 'bg-mine-green/10', border: 'border-mine-green/30' },
  warning: { label: '预警', color: 'text-mine-amber', bg: 'bg-mine-amber/10', border: 'border-mine-amber/30' },
  critical: { label: '临界', color: 'text-mine-red', bg: 'bg-mine-red/10', border: 'border-mine-red/30' },
};

export default function Monitor() {
  const [selectedPoints, setSelectedPoints] = useState<string[]>(
    monitorPoints.map((p) => p.id)
  );

  const total = monitorPoints.length;
  const normal = monitorPoints.filter((p) => p.status === 'normal').length;
  const warning = monitorPoints.filter((p) => p.status === 'warning').length;
  const critical = monitorPoints.filter((p) => p.status === 'critical').length;

  const statCards = [
    { label: '监测点总数', value: total, icon: Activity, color: 'text-mine-cyan' },
    { label: '正常', value: normal, icon: CheckCircle, color: 'text-mine-green' },
    { label: '预警', value: warning, icon: AlertTriangle, color: 'text-mine-amber' },
    { label: '临界', value: critical, icon: AlertOctagon, color: 'text-mine-red' },
  ];

  const togglePoint = (id: string) => {
    setSelectedPoints((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const trendOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#7A8BA0' },
    tooltip: { trigger: 'axis', backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' } },
    legend: {
      data: monitorPoints
        .filter((p) => selectedPoints.includes(p.id))
        .flatMap((p) => [`${p.name}-瓦斯`, `${p.name}-粉尘`]),
      textStyle: { color: '#7A8BA0', fontSize: 10 },
      type: 'scroll',
      bottom: 0,
    },
    grid: { top: 30, right: 20, bottom: 50, left: 50 },
    xAxis: {
      type: 'category',
      data: monitorPoints[0]?.history.map((h) => h.timestamp) || [],
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
    },
    yAxis: [
      {
        type: 'value',
        name: '瓦斯(%)',
        nameTextStyle: { color: '#7A8BA0' },
        axisLine: { lineStyle: { color: '#243352' } },
        axisLabel: { color: '#7A8BA0' },
        splitLine: { lineStyle: { color: '#1A2A42' } },
      },
      {
        type: 'value',
        name: '粉尘(mg/m³)',
        nameTextStyle: { color: '#7A8BA0' },
        axisLine: { lineStyle: { color: '#243352' } },
        axisLabel: { color: '#7A8BA0' },
        splitLine: { show: false },
      },
    ],
    series: monitorPoints
      .filter((p) => selectedPoints.includes(p.id))
      .flatMap((p, idx) => {
        const colors = ['#00F0FF', '#FFB800', '#00D68F', '#4A7BCC', '#FF3B3B', '#A78BFA'];
        const baseColor = colors[idx % colors.length];
        return [
          {
            name: `${p.name}-瓦斯`,
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 1.5, color: baseColor },
            itemStyle: { color: baseColor },
            data: p.history.map((h) => h.gas),
          },
          {
            name: `${p.name}-粉尘`,
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 1.5, color: baseColor, type: 'dashed' },
            itemStyle: { color: baseColor },
            data: p.history.map((h) => h.dust),
          },
        ];
      }),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="mine-card flex items-center gap-4">
            <div className={`${card.color} opacity-80`}>
              <card.icon size={28} />
            </div>
            <div>
              <div className={`stat-value ${card.color}`}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {monitorPoints.map((point) => {
          const cfg = statusConfig[point.status];
          const gasPercent = (point.gasConcentration / point.gasThreshold) * 100;
          const dustPercent = (point.dustConcentration / point.dustThreshold) * 100;
          return (
            <div key={point.id} className="mine-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-mine-text font-medium">{point.name}</div>
                  <div className="text-mine-muted text-xs">{point.location}</div>
                </div>
                <span className={`${cfg.color} ${cfg.bg} ${cfg.border} border text-xs px-2 py-0.5 rounded-full`}>
                  {cfg.label}
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-mine-muted">瓦斯浓度</span>
                    <span className={gasPercent > 80 ? 'text-mine-red' : gasPercent > 60 ? 'text-mine-amber' : 'text-mine-green'}>
                      {point.gasConcentration}% / {point.gasThreshold}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-mine-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${gasPercent > 80 ? 'bg-mine-red' : gasPercent > 60 ? 'bg-mine-amber' : 'bg-mine-green'}`}
                      style={{ width: `${Math.min(gasPercent, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-mine-muted">粉尘浓度</span>
                    <span className={dustPercent > 80 ? 'text-mine-red' : dustPercent > 60 ? 'text-mine-amber' : 'text-mine-green'}>
                      {point.dustConcentration}mg/m³ / {point.dustThreshold}
                    </span>
                  </div>
                  <div className="h-1.5 bg-mine-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${dustPercent > 80 ? 'bg-mine-red' : dustPercent > 60 ? 'bg-mine-amber' : 'bg-mine-green'}`}
                      style={{ width: `${Math.min(dustPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div
                className="text-xs text-mine-cyan cursor-pointer hover:underline"
                onClick={() => togglePoint(point.id)}
              >
                {selectedPoints.includes(point.id) ? '✓ 已加入趋势图' : '+ 添加到趋势图'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mine-card">
        <div className="text-mine-text font-medium mb-3">24小时监测趋势</div>
        <ReactECharts option={trendOption} style={{ height: 320 }} />
      </div>
    </div>
  );
}
