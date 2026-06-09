import { BarChart3, TrendingUp, Target, Trophy } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '@/store';

export default function Production() {
  const financeReports = useAppStore(s => s.financeReports);
  const report = financeReports[0];
  const totalOutput = report.teamOutputs.reduce((s, t) => s + t.output, 0);
  const totalTarget = report.teamOutputs.reduce((s, t) => s + t.target, 0);
  const completionRate = ((totalOutput / totalTarget) * 100).toFixed(1);
  const dailyAvg = Math.round(totalOutput / 30);
  const bestTeam = report.teamOutputs.reduce((a, b) => (a.output > b.output ? a : b));

  const statCards = [
    { label: '本月总产量', value: `${(totalOutput / 10000).toFixed(1)}万吨`, icon: BarChart3, color: 'text-mine-cyan' },
    { label: '目标完成率', value: `${completionRate}%`, icon: Target, color: 'text-mine-green' },
    { label: '日均产量', value: `${dailyAvg}吨`, icon: TrendingUp, color: 'text-mine-amber' },
    { label: '最高班组产量', value: bestTeam.team, icon: Trophy, color: 'text-mine-blue' },
  ];

  const barOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#7A8BA0' },
    tooltip: { trigger: 'axis', backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' } },
    legend: { data: ['实际产量', '目标产量'], textStyle: { color: '#7A8BA0' }, top: 0 },
    grid: { top: 40, right: 20, bottom: 30, left: 60 },
    xAxis: {
      type: 'category',
      data: report.teamOutputs.map((t) => t.team),
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
    },
    yAxis: {
      type: 'value',
      name: '产量(吨)',
      nameTextStyle: { color: '#7A8BA0' },
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
      splitLine: { lineStyle: { color: '#1A2A42' } },
    },
    series: [
      {
        name: '实际产量',
        type: 'bar',
        barWidth: '30%',
        itemStyle: { color: '#00F0FF' },
        data: report.teamOutputs.map((t) => t.output),
      },
      {
        name: '目标产量',
        type: 'bar',
        barWidth: '30%',
        itemStyle: { color: '#243352' },
        data: report.teamOutputs.map((t) => t.target),
      },
    ],
  };

  const days = Array.from({ length: 30 }, (_, i) => `${i + 1}日`);
  const dailyData = Array.from({ length: 30 }, () => Math.round(2800 + Math.random() * 1200));

  const lineOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#7A8BA0' },
    tooltip: { trigger: 'axis', backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' } },
    grid: { top: 20, right: 20, bottom: 30, left: 60 },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0', interval: 2 },
    },
    yAxis: {
      type: 'value',
      name: '产量(吨)',
      nameTextStyle: { color: '#7A8BA0' },
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
      splitLine: { lineStyle: { color: '#1A2A42' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#00D68F', width: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,214,143,0.3)' }, { offset: 1, color: 'rgba(0,214,143,0)' }] } },
        data: dailyData,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="mine-card flex items-center gap-4">
            <div className={card.color}><card.icon size={24} /></div>
            <div>
              <div className={`stat-value ${card.color}`}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="mine-card">
          <div className="text-mine-text font-medium mb-3">班组产量 vs 目标</div>
          <ReactECharts option={barOption} style={{ height: 280 }} />
        </div>
        <div className="mine-card">
          <div className="text-mine-text font-medium mb-3">本月日产量趋势</div>
          <ReactECharts option={lineOption} style={{ height: 280 }} />
        </div>
      </div>

      <div className="mine-card overflow-x-auto">
        <div className="text-mine-text font-medium mb-4">班组产量明细</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mine-border">
              <th className="text-left text-mine-muted py-3 px-4 font-medium">班组</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">实际产量</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">目标产量</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">完成率</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">差距</th>
            </tr>
          </thead>
          <tbody>
            {report.teamOutputs.map((t) => {
              const rate = ((t.output / t.target) * 100).toFixed(1);
              const diff = t.output - t.target;
              return (
                <tr key={t.team} className="border-b border-mine-border/50 hover:bg-mine-bg/50">
                  <td className="text-mine-text py-3 px-4 font-medium">{t.team}</td>
                  <td className="text-center text-mine-cyan py-3 px-4 font-din">{t.output.toLocaleString()}</td>
                  <td className="text-center text-mine-muted py-3 px-4 font-din">{t.target.toLocaleString()}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`font-din ${parseFloat(rate) >= 100 ? 'text-mine-green' : 'text-mine-amber'}`}>
                      {rate}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`font-din ${diff >= 0 ? 'text-mine-green' : 'text-mine-red'}`}>
                      {diff >= 0 ? '+' : ''}{diff.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
