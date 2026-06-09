import { useState } from 'react';
import { FlaskConical, Upload, Filter } from 'lucide-react';
import { oreSamples } from '@/data/quality';
import type { OreSample } from '@/types';

const gradeConfig: Record<string, { label: string; color: string; bg: string }> = {
  premium: { label: '特优', color: 'text-mine-cyan', bg: 'bg-mine-cyan/10' },
  grade_a: { label: '优', color: 'text-mine-green', bg: 'bg-mine-green/10' },
  grade_b: { label: '良', color: 'text-mine-blue', bg: 'bg-mine-blue/10' },
  grade_c: { label: '合格', color: 'text-mine-amber', bg: 'bg-mine-amber/10' },
  low: { label: '低品位', color: 'text-mine-red', bg: 'bg-mine-red/10' },
};

const gradeFilters = [
  { key: 'all', label: '全部' },
  { key: 'premium', label: '特优' },
  { key: 'grade_a', label: '优' },
  { key: 'grade_b', label: '良' },
  { key: 'grade_c', label: '合格' },
  { key: 'low', label: '低品位' },
];

interface NewSample {
  location: string;
  collector: string;
  feContent: string;
  sContent: string;
  moisture: string;
  granularity: string;
}

export default function Samples() {
  const [filter, setFilter] = useState('all');
  const [samples, setSamples] = useState(oreSamples);
  const [showForm, setShowForm] = useState(false);
  const [newSample, setNewSample] = useState<NewSample>({
    location: '',
    collector: '',
    feContent: '',
    sContent: '',
    moisture: '',
    granularity: '',
  });

  const total = samples.length;
  const highGrade = samples.filter((s) => s.grade === 'premium' || s.grade === 'grade_a').length;
  const midGrade = samples.filter((s) => s.grade === 'grade_b' || s.grade === 'grade_c').length;
  const lowGrade = samples.filter((s) => s.grade === 'low').length;

  const statCards = [
    { label: '总样本数', value: total, color: 'text-mine-cyan' },
    { label: '高品位', value: highGrade, color: 'text-mine-green' },
    { label: '中品位', value: midGrade, color: 'text-mine-blue' },
    { label: '低品位', value: lowGrade, color: 'text-mine-red' },
  ];

  const filtered = filter === 'all' ? samples : samples.filter((s) => s.grade === filter);

  const handleAddSample = () => {
    if (!newSample.location || !newSample.collector) return;
    const fe = parseFloat(newSample.feContent) || 0;
    const s = parseFloat(newSample.sContent) || 0;
    const m = parseFloat(newSample.moisture) || 0;
    const g = parseFloat(newSample.granularity) || 0;
    const score = Math.round(fe * 1.2 - s * 10 - m * 2 - g * 0.5);
    let grade: OreSample['grade'] = 'low';
    if (score >= 90) grade = 'premium';
    else if (score >= 75) grade = 'grade_a';
    else if (score >= 60) grade = 'grade_b';
    else if (score >= 40) grade = 'grade_c';
    const id = `OS${String(samples.length + 1).padStart(3, '0')}`;
    setSamples([
      ...samples,
      {
        id,
        sampleDate: new Date().toISOString().slice(0, 10),
        location: newSample.location,
        collector: newSample.collector,
        data: { feContent: fe, sContent: s, moisture: m, granularity: g },
        grade,
        gradeScore: score,
        processParams: { crushSize: 15, flotationTime: 10, reagentDosage: 2.5 },
      },
    ]);
    setNewSample({ location: '', collector: '', feContent: '', sContent: '', moisture: '', granularity: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="mine-card flex items-center gap-4">
            <div className={card.color}><FlaskConical size={24} /></div>
            <div>
              <div className={`stat-value ${card.color}`}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mine-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-mine-text font-medium">
            <Upload size={16} /> 添加新样本
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-mine-cyan text-sm hover:underline"
          >
            {showForm ? '收起' : '展开'}
          </button>
        </div>
        {showForm && (
          <div className="grid grid-cols-3 gap-3 bg-mine-bg rounded-lg p-4">
            <div>
              <label className="stat-label block mb-1">采样位置</label>
              <input
                value={newSample.location}
                onChange={(e) => setNewSample({ ...newSample, location: e.target.value })}
                className="w-full bg-mine-card border border-mine-border rounded px-3 py-1.5 text-mine-text text-sm focus:outline-none focus:border-mine-cyan"
                placeholder="例: A3采掘面"
              />
            </div>
            <div>
              <label className="stat-label block mb-1">采集人</label>
              <input
                value={newSample.collector}
                onChange={(e) => setNewSample({ ...newSample, collector: e.target.value })}
                className="w-full bg-mine-card border border-mine-border rounded px-3 py-1.5 text-mine-text text-sm focus:outline-none focus:border-mine-cyan"
                placeholder="采集人姓名"
              />
            </div>
            <div>
              <label className="stat-label block mb-1">铁含量(%)</label>
              <input
                type="number"
                value={newSample.feContent}
                onChange={(e) => setNewSample({ ...newSample, feContent: e.target.value })}
                className="w-full bg-mine-card border border-mine-border rounded px-3 py-1.5 text-mine-text text-sm focus:outline-none focus:border-mine-cyan"
              />
            </div>
            <div>
              <label className="stat-label block mb-1">硫含量(%)</label>
              <input
                type="number"
                value={newSample.sContent}
                onChange={(e) => setNewSample({ ...newSample, sContent: e.target.value })}
                className="w-full bg-mine-card border border-mine-border rounded px-3 py-1.5 text-mine-text text-sm focus:outline-none focus:border-mine-cyan"
              />
            </div>
            <div>
              <label className="stat-label block mb-1">水分(%)</label>
              <input
                type="number"
                value={newSample.moisture}
                onChange={(e) => setNewSample({ ...newSample, moisture: e.target.value })}
                className="w-full bg-mine-card border border-mine-border rounded px-3 py-1.5 text-mine-text text-sm focus:outline-none focus:border-mine-cyan"
              />
            </div>
            <div>
              <label className="stat-label block mb-1">粒度(mm)</label>
              <input
                type="number"
                value={newSample.granularity}
                onChange={(e) => setNewSample({ ...newSample, granularity: e.target.value })}
                className="w-full bg-mine-card border border-mine-border rounded px-3 py-1.5 text-mine-text text-sm focus:outline-none focus:border-mine-cyan"
              />
            </div>
            <div className="col-span-3 flex justify-end">
              <button onClick={handleAddSample} className="mine-btn-primary text-sm">提交样本</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Filter size={14} className="text-mine-muted" />
        {gradeFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              filter === f.key
                ? 'bg-mine-cyan/20 text-mine-cyan border border-mine-cyan/30'
                : 'text-mine-muted hover:text-mine-text border border-transparent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map((sample) => {
          const gCfg = gradeConfig[sample.grade ?? 'low'];
          return (
            <div key={sample.id} className="mine-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-mine-text font-medium">{sample.location}</div>
                  <div className="text-mine-muted text-xs">
                    {sample.collector} · {sample.sampleDate}
                  </div>
                </div>
                <span className={`${gCfg.color} ${gCfg.bg} text-xs px-2 py-0.5 rounded`}>
                  {gCfg.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-mine-bg rounded px-3 py-2">
                  <div className="text-mine-muted text-xs">铁含量</div>
                  <div className="font-din text-mine-text">{sample.data.feContent}%</div>
                </div>
                <div className="bg-mine-bg rounded px-3 py-2">
                  <div className="text-mine-muted text-xs">硫含量</div>
                  <div className="font-din text-mine-text">{sample.data.sContent}%</div>
                </div>
                <div className="bg-mine-bg rounded px-3 py-2">
                  <div className="text-mine-muted text-xs">水分</div>
                  <div className="font-din text-mine-text">{sample.data.moisture}%</div>
                </div>
                <div className="bg-mine-bg rounded px-3 py-2">
                  <div className="text-mine-muted text-xs">粒度</div>
                  <div className="font-din text-mine-text">{sample.data.granularity}mm</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
