import { DollarSign, Wrench, Zap, TrendingDown } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { financeReports } from '@/data/finance';

export default function Cost() {
  const report = financeReports[0];
  const totalMaintenance = report.maintenanceCosts.reduce((s, c) => s + c.amount, 0);
  const totalEnergy = report.energyConsumption.reduce((s, e) => s + e.electricity + e.water + e.fuel, 0);
  const totalCost = report.totalCost;
  const yoyChange = -3.2;

  const statCards = [
    { label: '总成本', value: `${(totalCost / 10000).toFixed(1)}万`, icon: DollarSign, color: 'text-mine-cyan' },
    { label: '维修成本', value: `${(totalMaintenance / 10000).toFixed(1)}万`, icon: Wrench, color: 'text-mine-amber' },
    { label: '能耗成本', value: `${(totalEnergy / 10000).toFixed(1)}万`, icon: Zap, color: 'text-mine-blue' },
    { label: '成本同比下降', value: `${yoyChange}%`, icon: TrendingDown, color: 'text-mine-green' },
  ];

  const pieOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#7A8BA0' },
    tooltip: { trigger: 'item', backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' } },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#7A8BA0' } },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        label: { color: '#7A8BA0', formatter: '{b}: {d}%' },
        itemStyle: { borderColor: '#1A2A42', borderWidth: 2 },
        data: report.maintenanceCosts.map((c, i) => ({
          name: c.category,
          value: c.amount,
          itemStyle: { color: ['#00F0FF', '#FFB800', '#00D68F', '#4A7BCC'][i % 4] },
        })),
      },
    ],
  };

  const stackedBarOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#7A8BA0' },
    tooltip: { trigger: 'axis', backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' } },
    legend: { data: ['电费', '水费', '燃料'], textStyle: { color: '#7A8BA0' }, top: 0 },
    grid: { top: 40, right: 20, bottom: 30, left: 60 },
    xAxis: {
      type: 'category',
      data: report.energyConsumption.map((e) => e.month),
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
    },
    yAxis: {
      type: 'value',
      name: '费用(元)',
      nameTextStyle: { color: '#7A8BA0' },
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
      splitLine: { lineStyle: { color: '#1A2A42' } },
    },
    series: [
      {
        name: '电费',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#00F0FF' },
        data: report.energyConsumption.map((e) => e.electricity),
      },
      {
        name: '水费',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#4A7BCC' },
        data: report.energyConsumption.map((e) => e.water),
      },
      {
        name: '燃料',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#FFB800' },
        data: report.energyConsumption.map((e) => e.fuel),
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
          <div className="text-mine-text font-medium mb-3">维修成本分布</div>
          <ReactECharts option={pieOption} style={{ height: 280 }} />
        </div>
        <div className="mine-card">
          <div className="text-mine-text font-medium mb-3">月度能耗构成</div>
          <ReactECharts option={stackedBarOption} style={{ height: 280 }} />
        </div>
      </div>

      <div className="mine-card overflow-x-auto">
        <div className="text-mine-text font-medium mb-4">成本明细</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mine-border">
              <th className="text-left text-mine-muted py-3 px-4 font-medium">类别</th>
              <th className="text-left text-mine-muted py-3 px-4 font-medium">项目</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">金额(元)</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">占比</th>
            </tr>
          </thead>
          <tbody>
            {report.maintenanceCosts.map((c) => (
              <tr key={c.category} className="border-b border-mine-border/50 hover:bg-mine-bg/50">
                <td className="text-mine-text py-3 px-4">维修</td>
                <td className="text-mine-text py-3 px-4">{c.category}</td>
                <td className="text-center text-mine-cyan py-3 px-4 font-din">{c.amount.toLocaleString()}</td>
                <td className="text-center text-mine-muted py-3 px-4 font-din">
                  {((c.amount / totalMaintenance) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
            {report.energyConsumption.map((e) => (
              <tr key={e.month} className="border-b border-mine-border/50 hover:bg-mine-bg/50">
                <td className="text-mine-text py-3 px-4">能耗</td>
                <td className="text-mine-text py-3 px-4">{e.month} - 电费</td>
                <td className="text-center text-mine-cyan py-3 px-4 font-din">{e.electricity.toLocaleString()}</td>
                <td className="text-center text-mine-muted py-3 px-4 font-din">
                  {((e.electricity / totalEnergy) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
