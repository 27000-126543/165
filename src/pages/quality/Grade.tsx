import { useState } from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { oreSamples } from '@/data/quality';

const gradeStyle: Record<string, { label: string; color: string; border: string; bg: string; glow: string }> = {
  premium: { label: '特优', color: 'text-mine-cyan', border: 'border-mine-cyan/50', bg: 'bg-mine-cyan/10', glow: 'shadow-[0_0_30px_rgba(0,240,255,0.3)]' },
  grade_a: { label: '优', color: 'text-mine-green', border: 'border-mine-green/50', bg: 'bg-mine-green/10', glow: 'shadow-[0_0_20px_rgba(0,214,143,0.2)]' },
  grade_b: { label: '良', color: 'text-mine-blue', border: 'border-mine-blue/50', bg: 'bg-mine-blue/10', glow: '' },
  grade_c: { label: '合格', color: 'text-mine-amber', border: 'border-mine-amber/50', bg: 'bg-mine-amber/10', glow: '' },
  low: { label: '低品位', color: 'text-mine-red', border: 'border-mine-red/50', bg: 'bg-mine-red/10', glow: '' },
};

const metrics = [
  { key: 'feContent', label: '铁含量', unit: '%', weight: 1.2, optimal: 65, direction: 'up' as const },
  { key: 'sContent', label: '硫含量', unit: '%', weight: 10, optimal: 0, direction: 'down' as const },
  { key: 'moisture', label: '水分', unit: '%', weight: 2, optimal: 0, direction: 'down' as const },
  { key: 'granularity', label: '粒度', unit: 'mm', weight: 0.5, optimal: 0, direction: 'down' as const },
] as const;

export default function Grade() {
  const [selectedId, setSelectedId] = useState(oreSamples[0].id);
  const sample = oreSamples.find((s) => s.id === selectedId) || oreSamples[0];
  const style = gradeStyle[sample.grade ?? 'low'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-mine-text text-lg font-medium flex items-center gap-2">
          <Award size={20} /> 品位判定
        </h2>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-mine-card border border-mine-border rounded-lg px-4 py-2 text-mine-text text-sm focus:outline-none focus:border-mine-cyan"
        >
          {oreSamples.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} - {s.location} ({s.sampleDate})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="mine-card space-y-4">
          <div className="text-mine-muted text-xs uppercase tracking-wider">样本详情</div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-mine-muted text-sm">样本ID</span>
              <span className="text-mine-text font-din">{sample.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mine-muted text-sm">采样位置</span>
              <span className="text-mine-text">{sample.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mine-muted text-sm">采集人</span>
              <span className="text-mine-text">{sample.collector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mine-muted text-sm">采样日期</span>
              <span className="text-mine-text font-din">{sample.sampleDate}</span>
            </div>
            <div className="border-t border-mine-border pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-mine-muted text-sm">铁含量</span>
                <span className="text-mine-text font-din">{sample.data.feContent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mine-muted text-sm">硫含量</span>
                <span className="text-mine-text font-din">{sample.data.sContent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mine-muted text-sm">水分</span>
                <span className="text-mine-text font-din">{sample.data.moisture}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mine-muted text-sm">粒度</span>
                <span className="text-mine-text font-din">{sample.data.granularity}mm</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`mine-card flex flex-col items-center justify-center ${style.border} ${style.glow}`}>
          <div className="text-mine-muted text-xs mb-2">品位等级</div>
          <div className={`${style.color} text-5xl font-bold font-din mb-2`}>{sample.gradeScore}</div>
          <div className={`${style.color} ${style.bg} text-lg px-4 py-1 rounded-full ${style.border} border`}>
            {style.label}
          </div>
          <div className="mt-4 flex items-center gap-1 text-mine-muted text-xs">
            <TrendingUp size={12} /> 综合评分
          </div>
        </div>

        <div className="mine-card space-y-4">
          <div className="text-mine-muted text-xs uppercase tracking-wider">选矿参数</div>
          <div className="space-y-3">
            {Object.entries(sample.processParams).map(([key, val]) => {
              const labels: Record<string, string> = {
                crushSize: '破碎粒度',
                flotationTime: '浮选时间',
                reagentDosage: '药剂用量',
              };
              const units: Record<string, string> = {
                crushSize: 'mm',
                flotationTime: 'min',
                reagentDosage: 'kg/t',
              };
              return (
                <div key={key} className="flex justify-between">
                  <span className="text-mine-muted text-sm">{labels[key] || key}</span>
                  <span className="text-mine-text font-din">{val} {units[key] || ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mine-card">
        <div className="text-mine-text font-medium mb-4">判定依据</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mine-border">
              <th className="text-left text-mine-muted py-3 px-4 font-medium">指标</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">实际值</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">权重</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">贡献分</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">影响方向</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => {
              const val = sample.data[m.key as keyof typeof sample.data];
              const contribution = m.direction === 'up' ? val * m.weight : -val * m.weight;
              return (
                <tr key={m.key} className="border-b border-mine-border/50 hover:bg-mine-bg/50">
                  <td className="text-mine-text py-3 px-4">{m.label}</td>
                  <td className="text-center text-mine-text py-3 px-4 font-din">{val}{m.unit}</td>
                  <td className="text-center text-mine-muted py-3 px-4">×{m.weight}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`font-din ${contribution >= 0 ? 'text-mine-green' : 'text-mine-red'}`}>
                      {contribution > 0 ? '+' : ''}{contribution.toFixed(1)}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded ${m.direction === 'up' ? 'bg-mine-green/10 text-mine-green' : 'bg-mine-red/10 text-mine-red'}`}>
                      {m.direction === 'up' ? '↑ 越高越好' : '↓ 越低越好'}
                    </span>
                  </td>
                </tr>
              );
            })}
            <tr className="bg-mine-bg/30">
              <td className="text-mine-text py-3 px-4 font-medium">合计</td>
              <td colSpan={2}></td>
              <td className="text-center py-3 px-4">
                <span className="font-din text-mine-cyan text-lg font-bold">{sample.gradeScore}</span>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
