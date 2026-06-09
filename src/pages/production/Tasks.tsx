import { useState } from 'react';
import { ClipboardList, Users, Calendar, ArrowRight, CheckCircle, PlayCircle, Send } from 'lucide-react';
import { productionTasks } from '@/data/production';

type FilterKey = 'all' | 'draft' | 'issued' | 'in_progress' | 'completed';

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'draft', label: '草稿' },
  { key: 'issued', label: '已下达' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
];

const statusCfg: Record<string, { label: string; cls: string }> = {
  draft: { label: '草稿', cls: 'bg-mine-border/50 text-mine-muted' },
  issued: { label: '已下达', cls: 'bg-mine-blue/20 text-mine-blue' },
  in_progress: { label: '进行中', cls: 'bg-mine-cyan/20 text-mine-cyan' },
  completed: { label: '已完成', cls: 'bg-mine-green/20 text-mine-green' },
};

const priorityCfg: Record<string, { label: string; cls: string }> = {
  high: { label: '高', cls: 'bg-mine-red/20 text-mine-red' },
  medium: { label: '中', cls: 'bg-mine-amber/20 text-mine-amber' },
  low: { label: '低', cls: 'bg-mine-green/20 text-mine-green' },
};

export default function Tasks() {
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = filter === 'all' ? productionTasks : productionTasks.filter((t) => t.status === filter);

  const total = productionTasks.length;
  const completed = productionTasks.filter((t) => t.status === 'completed').length;
  const inProgress = productionTasks.filter((t) => t.status === 'in_progress').length;
  const draft = productionTasks.filter((t) => t.status === 'draft').length;

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: ClipboardList, label: '总任务', value: total, color: 'text-mine-cyan' },
          { icon: CheckCircle, label: '已完成', value: completed, color: 'text-mine-green' },
          { icon: PlayCircle, label: '进行中', value: inProgress, color: 'text-mine-amber' },
          { icon: Send, label: '草稿', value: draft, color: 'text-mine-muted' },
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

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${filter === f.key ? 'bg-mine-cyan/20 text-mine-cyan border border-mine-cyan/40' : 'bg-mine-card text-mine-muted border border-mine-border hover:text-mine-text'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((task) => {
          const sc = statusCfg[task.status];
          const pc = priorityCfg[task.priority];
          return (
            <div key={task.id} className="mine-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-mine-text font-medium">{task.miningFaceName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${pc.cls}`}>{pc.label}优先</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${sc.cls}`}>{sc.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-mine-muted">
                  <ClipboardList size={14} />
                  <span>目标: <span className="text-mine-text font-din">{task.target}</span> 吨</span>
                </div>
                <div className="flex items-center gap-1.5 text-mine-muted">
                  <Calendar size={14} />
                  <span>{task.date}</span>
                </div>
              </div>
              {task.assigned.length > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-mine-muted">
                  <Users size={14} />
                  <span className="flex flex-wrap gap-1">
                    {task.assigned.map((a) => (
                      <span key={a} className="bg-mine-bg px-2 py-0.5 rounded text-xs text-mine-text">{a}</span>
                    ))}
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                {task.status === 'draft' && (
                  <button className="mine-btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                    <Send size={12} />下达
                  </button>
                )}
                {task.status === 'issued' && (
                  <button className="mine-btn-outline text-xs px-3 py-1.5 flex items-center gap-1">
                    <PlayCircle size={12} />开始
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <button className="mine-btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                    <CheckCircle size={12} />完成
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
