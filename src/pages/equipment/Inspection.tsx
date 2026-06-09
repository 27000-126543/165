import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { ClipboardCheck, AlertTriangle, Clock, Thermometer, Activity } from 'lucide-react';
import { equipmentList, inspectionRecords } from '@/data/equipment';

export default function Inspection() {
  const [selectedEq, setSelectedEq] = useState(equipmentList[0].id);
  const [vibration, setVibration] = useState('');
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');

  const todayCount = inspectionRecords.filter((r) => r.timestamp.startsWith('2026-06-09')).length;
  const abnormalCount = inspectionRecords.filter((r) => r.vibration > 5 || r.temperature > 85).length;
  const pendingCount = equipmentList.filter((e) => e.status === 'running' || e.status === 'warning').length;

  const eqRecords = inspectionRecords.filter((r) => r.equipmentId === selectedEq);
  const vibData = eqRecords.map((r) => ({ time: r.timestamp.slice(5, 16), value: r.vibration }));
  const tempData = eqRecords.map((r) => ({ time: r.timestamp.slice(5, 16), value: r.temperature }));

  const makeLineOption = (data: { time: string; value: number }[], label: string, color: string, markLine?: number) => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' as const, backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' } },
    grid: { left: 50, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category' as const, data: data.map((d) => d.time), axisLine: { lineStyle: { color: '#243352' } }, axisLabel: { color: '#7A8BA0', fontSize: 10 } },
    yAxis: { type: 'value' as const, axisLine: { lineStyle: { color: '#243352' } }, axisLabel: { color: '#7A8BA0' }, splitLine: { lineStyle: { color: '#1A2A42' } } },
    series: [
      {
        name: label,
        type: 'line' as const,
        data: data.map((d) => d.value),
        smooth: true,
        lineStyle: { color, width: 2 },
        itemStyle: { color },
        areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: color.replace(')', ',0.3)').replace('rgb', 'rgba') }, { offset: 1, color: 'transparent' }] } },
        ...(markLine ? { markLine: { silent: true, lineStyle: { color: '#FF3B3B', type: 'dashed' as const }, data: [{ yAxis: markLine }], label: { color: '#FF3B3B', fontSize: 10 } } } : {}),
      },
    ],
  });

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: ClipboardCheck, label: '今日巡检数', value: todayCount, color: 'text-mine-cyan' },
          { icon: AlertTriangle, label: '异常数', value: abnormalCount, color: 'text-mine-red' },
          { icon: Clock, label: '待巡检设备', value: pendingCount, color: 'text-mine-amber' },
        ].map((s) => (
          <div key={s.label} className="mine-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-mine-bg ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-value ${s.color}`}>{s.value}<span className="text-sm text-mine-muted ml-1">项</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 mine-card space-y-4">
          <h3 className="text-mine-text font-medium">巡检录入</h3>
          <div>
            <label className="block text-mine-muted text-xs mb-1">选择设备</label>
            <select
              value={selectedEq}
              onChange={(e) => setSelectedEq(e.target.value)}
              className="w-full bg-mine-bg border border-mine-border rounded-lg px-3 py-2 text-sm text-mine-text focus:outline-none focus:border-mine-cyan/50"
            >
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name} - {eq.location}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-mine-muted text-xs mb-1">振动值 (mm/s)</label>
              <div className="relative">
                <Activity size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mine-muted" />
                <input
                  type="number"
                  value={vibration}
                  onChange={(e) => setVibration(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-mine-bg border border-mine-border rounded-lg pl-9 pr-3 py-2 text-sm text-mine-text placeholder:text-mine-muted focus:outline-none focus:border-mine-cyan/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-mine-muted text-xs mb-1">温度 (°C)</label>
              <div className="relative">
                <Thermometer size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mine-muted" />
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-mine-bg border border-mine-border rounded-lg pl-9 pr-3 py-2 text-sm text-mine-text placeholder:text-mine-muted focus:outline-none focus:border-mine-cyan/50"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-mine-muted text-xs mb-1">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="输入巡检备注..."
              rows={3}
              className="w-full bg-mine-bg border border-mine-border rounded-lg px-3 py-2 text-sm text-mine-text placeholder:text-mine-muted focus:outline-none focus:border-mine-cyan/50 resize-none"
            />
          </div>
          <button className="mine-btn-primary w-full">提交巡检</button>
        </div>

        <div className="col-span-3 mine-card overflow-auto max-h-[360px]">
          <h3 className="text-mine-text font-medium mb-2">最近巡检记录</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mine-border">
                {['设备名称', '巡检人', '时间', '振动', '温度', '备注'].map((h) => (
                  <th key={h} className="text-left text-mine-muted font-medium py-2 px-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inspectionRecords.map((r) => (
                <tr key={r.id} className="border-b border-mine-border/50 hover:bg-mine-bg/50">
                  <td className="py-2 px-2 text-mine-text whitespace-nowrap">{r.equipmentName}</td>
                  <td className="py-2 px-2 text-mine-text whitespace-nowrap">{r.inspector}</td>
                  <td className="py-2 px-2 text-mine-muted whitespace-nowrap">{r.timestamp}</td>
                  <td className={`py-2 px-2 font-din whitespace-nowrap ${r.vibration > 5 ? 'text-mine-red' : 'text-mine-text'}`}>{r.vibration}</td>
                  <td className={`py-2 px-2 font-din whitespace-nowrap ${r.temperature > 85 ? 'text-mine-red' : 'text-mine-text'}`}>{r.temperature}°C</td>
                  <td className="py-2 px-2 text-mine-muted whitespace-nowrap max-w-[120px] truncate">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="mine-card">
          <h3 className="text-mine-text font-medium mb-1">振动趋势 - {equipmentList.find((e) => e.id === selectedEq)?.name}</h3>
          <ReactECharts option={makeLineOption(vibData, '振动(mm/s)', 'rgb(0,240,255)', 5)} style={{ height: 200 }} />
        </div>
        <div className="mine-card">
          <h3 className="text-mine-text font-medium mb-1">温度趋势 - {equipmentList.find((e) => e.id === selectedEq)?.name}</h3>
          <ReactECharts option={makeLineOption(tempData, '温度(°C)', 'rgb(255,184,0)', 85)} style={{ height: 200 }} />
        </div>
      </div>
    </div>
  );
}
