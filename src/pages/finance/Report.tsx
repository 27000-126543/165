import { DollarSign, FileText, Send, Download } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { financeReports } from '@/data/finance';

export default function Report() {
  const report = financeReports[0];

  const statCards = [
    { label: '总收入', value: `${(report.totalRevenue / 10000).toFixed(1)}万`, color: 'text-mine-green' },
    { label: '总成本', value: `${(report.totalCost / 10000).toFixed(1)}万`, color: 'text-mine-red' },
    { label: '利润', value: `${(report.profit / 10000).toFixed(1)}万`, color: 'text-mine-cyan' },
    { label: '利润率', value: `${report.profitMargin}%`, color: 'text-mine-amber' },
  ];

  const revenueCostOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#7A8BA0' },
    tooltip: { trigger: 'axis', backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' } },
    legend: { data: ['收入', '成本'], textStyle: { color: '#7A8BA0' }, top: 0 },
    grid: { top: 40, right: 20, bottom: 30, left: 60 },
    xAxis: {
      type: 'category',
      data: [report.period],
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
    },
    yAxis: {
      type: 'value',
      name: '金额(万元)',
      nameTextStyle: { color: '#7A8BA0' },
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
      splitLine: { lineStyle: { color: '#1A2A42' } },
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        barWidth: '35%',
        itemStyle: { color: '#00D68F' },
        data: [(report.totalRevenue / 10000).toFixed(1)],
      },
      {
        name: '成本',
        type: 'bar',
        barWidth: '35%',
        itemStyle: { color: '#FF3B3B' },
        data: [(report.totalCost / 10000).toFixed(1)],
      },
    ],
  };

  const profitTrendOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#7A8BA0' },
    tooltip: { trigger: 'axis', backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' } },
    grid: { top: 20, right: 20, bottom: 30, left: 60 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', report.period],
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
    },
    yAxis: {
      type: 'value',
      name: '利润率(%)',
      nameTextStyle: { color: '#7A8BA0' },
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
      splitLine: { lineStyle: { color: '#1A2A42' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#FFB800', width: 2 },
        itemStyle: { color: '#FFB800', borderColor: '#1A2A42', borderWidth: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,184,0,0.3)' }, { offset: 1, color: 'rgba(255,184,0,0)' }] } },
        data: [36.2, 38.1, 37.5, 39.0, report.profitMargin],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="mine-card flex items-center gap-4">
            <div className={card.color}><DollarSign size={24} /></div>
            <div>
              <div className={`stat-value ${card.color}`}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="mine-card flex flex-col items-center justify-center py-8">
          <div className="text-mine-muted text-xs mb-2">净利润</div>
          <div className="text-mine-cyan font-din text-5xl font-bold">{(report.profit / 10000).toFixed(1)}</div>
          <div className="text-mine-muted text-sm mt-1">万元</div>
          <div className="flex gap-6 mt-4 text-sm">
            <div className="text-center">
              <div className="text-mine-green font-din text-lg">{(report.totalRevenue / 10000).toFixed(1)}万</div>
              <div className="text-mine-muted text-xs">收入</div>
            </div>
            <div className="text-center">
              <div className="text-mine-red font-din text-lg">{(report.totalCost / 10000).toFixed(1)}万</div>
              <div className="text-mine-muted text-xs">成本</div>
            </div>
          </div>
        </div>
        <div className="mine-card flex flex-col items-center justify-center py-8">
          <div className="text-mine-muted text-xs mb-2">利润率</div>
          <div className="text-mine-amber font-din text-5xl font-bold">{report.profitMargin}</div>
          <div className="text-mine-muted text-sm mt-1">%</div>
          <div className="flex gap-6 mt-4 text-sm">
            <div className="text-center">
              <div className="text-mine-green font-din text-lg">↑ 2.1%</div>
              <div className="text-mine-muted text-xs">同比</div>
            </div>
            <div className="text-center">
              <div className="text-mine-cyan font-din text-lg">↑ 0.6%</div>
              <div className="text-mine-muted text-xs">环比</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="mine-card">
          <div className="text-mine-text font-medium mb-3">收入 vs 成本</div>
          <ReactECharts option={revenueCostOption} style={{ height: 260 }} />
        </div>
        <div className="mine-card">
          <div className="text-mine-text font-medium mb-3">利润率趋势</div>
          <ReactECharts option={profitTrendOption} style={{ height: 260 }} />
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <button className="mine-btn-primary flex items-center gap-2">
          <FileText size={16} /> 生成报表
        </button>
        <button className="mine-btn-outline flex items-center gap-2">
          <Send size={16} /> 推送管理层
        </button>
        <button className="mine-btn-outline flex items-center gap-2">
          <Download size={16} /> 导出PDF
        </button>
      </div>
    </div>
  );
}
