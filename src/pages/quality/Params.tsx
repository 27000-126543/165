import { Sliders, ArrowRight, Clock, User } from 'lucide-react';
import { oreSamples, processAdjustments } from '@/data/quality';

const paramLabels: Record<string, { label: string; unit: string }> = {
  crushSize: { label: '破碎粒度', unit: 'mm' },
  flotationTime: { label: '浮选时间', unit: 'min' },
  reagentDosage: { label: '药剂用量', unit: 'kg/t' },
};

export default function Params() {
  return (
    <div className="space-y-6">
      <h2 className="text-mine-text text-lg font-medium flex items-center gap-2">
        <Sliders size={20} /> 选矿参数
      </h2>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="text-mine-muted text-xs uppercase tracking-wider">当前工艺参数</div>
          {oreSamples.map((sample) => (
            <div key={sample.id} className="mine-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-mine-text text-sm font-medium">{sample.location}</div>
                  <div className="text-mine-muted text-xs">{sample.id} · {sample.collector}</div>
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(sample.processParams).map(([key, val]) => {
                  const cfg = paramLabels[key];
                  return (
                    <div key={key} className="flex justify-between items-center bg-mine-bg rounded px-3 py-2">
                      <span className="text-mine-muted text-sm">{cfg?.label || key}</span>
                      <span className="text-mine-cyan font-din text-sm">{val} <span className="text-mine-muted text-xs">{cfg?.unit || ''}</span></span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-3 space-y-4">
          <div className="text-mine-muted text-xs uppercase tracking-wider">参数调整历史</div>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-mine-border" />
            <div className="space-y-4">
              {processAdjustments.map((adj) => {
                const sample = oreSamples.find((s) => s.id === adj.sampleId);
                const cfg = paramLabels[adj.parameter];
                const isIncrease = adj.newValue > adj.oldValue;
                return (
                  <div key={adj.id} className="relative pl-12">
                    <div className={`absolute left-4 top-3 w-2.5 h-2.5 rounded-full ${isIncrease ? 'bg-mine-amber' : 'bg-mine-green'}`} />
                    <div className="mine-card space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-mine-text text-sm font-medium">
                          {sample?.location || adj.sampleId}
                        </div>
                        <div className="flex items-center gap-1 text-mine-muted text-xs">
                          <Clock size={11} /> {adj.timestamp}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-mine-muted text-sm">{cfg?.label || adj.parameter}</span>
                        <span className="font-din text-mine-red text-sm">{adj.oldValue}</span>
                        <ArrowRight size={14} className="text-mine-muted" />
                        <span className="font-din text-mine-green text-sm">{adj.newValue}</span>
                        <span className="text-mine-muted text-xs">{cfg?.unit || ''}</span>
                      </div>
                      <div className="text-mine-muted text-xs">{adj.reason}</div>
                      <div className="flex items-center gap-1 text-mine-muted text-xs">
                        <User size={11} /> {adj.operator}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
