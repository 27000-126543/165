import { useState, useMemo } from 'react';
import { Wrench, Clock, CheckCircle, AlertCircle, Package, Calendar, UserCheck, History, Download } from 'lucide-react';
import { useAppStore } from '@/store';

type FilterKey = 'all' | 'pending' | 'in_progress' | 'completed';

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
];

const statusCfg: Record<string, { label: string; cls: string; dot: string }> = {
  pending: { label: '待处理', cls: 'text-mine-amber', dot: 'bg-mine-amber' },
  in_progress: { label: '进行中', cls: 'text-mine-cyan', dot: 'bg-mine-cyan' },
  completed: { label: '已完成', cls: 'text-mine-green', dot: 'bg-mine-green' },
};

const typeCfg: Record<string, { label: string; cls: string }> = {
  emergency: { label: '紧急', cls: 'bg-mine-red/20 text-mine-red' },
  corrective: { label: '纠正性', cls: 'bg-mine-amber/20 text-mine-amber' },
  preventive: { label: '预防性', cls: 'bg-mine-blue/20 text-mine-blue' },
};

const priorityCfg: Record<string, { label: string; cls: string }> = {
  high: { label: '高', cls: 'bg-mine-red/20 text-mine-red' },
  medium: { label: '中', cls: 'bg-mine-amber/20 text-mine-amber' },
  low: { label: '低', cls: 'bg-mine-green/20 text-mine-green' },
};

export default function WorkOrders() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const maintenanceOrders = useAppStore((s) => s.maintenanceOrders);
  const updateWorkOrderStatus = useAppStore((s) => s.updateWorkOrderStatus);
  const allAuditLogs = useAppStore((s) => s.auditLogs);
  const auditLogs = useMemo(() => allAuditLogs.filter((l) => l.targetType === 'workorder'), [allAuditLogs]);

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlHighlight = searchParams?.get('highlight');
  if (urlHighlight && !highlightId) {
    setHighlightId(urlHighlight);
  }

  const handleExportLogs = () => {
    const header = '操作人,操作,详情,时间\n';
    const rows = auditLogs.map((l) => `"${l.operator}","${l.action}","${l.detail}","${l.timestamp}"`).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `工单操作留痕_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = filter === 'all' ? maintenanceOrders : maintenanceOrders.filter((o) => o.status === filter);

  const total = maintenanceOrders.length;
  const pending = maintenanceOrders.filter((o) => o.status === 'pending').length;
  const inProgress = maintenanceOrders.filter((o) => o.status === 'in_progress').length;
  const completed = maintenanceOrders.filter((o) => o.status === 'completed').length;

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Wrench, label: '总工单', value: total, color: 'text-mine-cyan' },
          { icon: Clock, label: '待处理', value: pending, color: 'text-mine-amber' },
          { icon: AlertCircle, label: '进行中', value: inProgress, color: 'text-mine-cyan' },
          { icon: CheckCircle, label: '已完成', value: completed, color: 'text-mine-green' },
        ].map((s) => (
          <div key={s.label} className="mine-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-mine-bg ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-value ${s.color}`}>{s.value}<span className="text-sm text-mine-muted ml-1">单</span></div>
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
        {filtered.map((order) => {
          const sc = statusCfg[order.status];
          const tc = typeCfg[order.type];
          const pc = priorityCfg[order.priority];
          const orderLogs = auditLogs.filter((l) => l.targetId === order.id);
          return (
            <div key={order.id} className={`mine-card space-y-3 transition-all ${highlightId === order.id ? 'ring-2 ring-mine-cyan/50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-mine-text font-medium">{order.equipmentName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${tc.cls}`}>{tc.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${pc.cls}`}>{pc.label}</span>
                </div>
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${sc.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                </span>
              </div>

              <p className="text-sm text-mine-muted">{order.predictedFault}</p>

              <div className="flex items-center gap-4 text-xs text-mine-muted">
                <span className="flex items-center gap-1"><Calendar size={12} />计划: {order.scheduledAt}</span>
                <span className="flex items-center gap-1"><Clock size={12} />创建: {order.createdAt}</span>
              </div>

              <div>
                <div className="flex items-center gap-1 text-xs text-mine-muted mb-1.5">
                  <Package size={12} />推荐备件
                </div>
                <div className="space-y-1">
                  {order.recommendedParts.map((part) => (
                    <div key={part.partNumber} className="flex items-center justify-between bg-mine-bg rounded px-2.5 py-1.5 text-xs">
                      <span className="text-mine-text">{part.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-mine-muted font-din">{part.partNumber}</span>
                        <span className={part.stock <= 2 ? 'text-mine-red' : 'text-mine-green'}>库存: {part.stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {orderLogs.length > 0 && (
                <div className="border-t border-mine-border pt-2">
                  <div className="flex items-center gap-1 text-xs text-mine-muted mb-1.5">
                    <History size={11} />操作记录
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {orderLogs.map((log) => (
                      <div key={log.id} className="text-xs text-mine-muted flex items-center gap-2">
                        <span className="text-mine-cyan">{log.operator}</span>
                        <span>{log.action}</span>
                        <span className="font-din ml-auto shrink-0">{log.timestamp.slice(11)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateWorkOrderStatus(order.id, 'in_progress')}
                    className="mine-btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <UserCheck size={12} />接单
                  </button>
                )}
                {order.status === 'in_progress' && (
                  <button
                    onClick={() => updateWorkOrderStatus(order.id, 'completed')}
                    className="mine-btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <CheckCircle size={12} />完成
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {auditLogs.length > 0 && (
        <div className="mine-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-mine-cyan" />
              <span className="text-mine-text font-medium text-sm">全部操作留痕</span>
              <span className="text-mine-muted text-xs">({auditLogs.length}条)</span>
            </div>
            <button onClick={handleExportLogs} className="mine-btn-outline text-xs py-1 flex items-center gap-1">
              <Download size={12} />导出CSV
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {auditLogs.slice(0, 20).map((log) => (
              <div key={log.id} className="flex items-center gap-3 text-sm">
                <span className="text-mine-cyan shrink-0">{log.operator}</span>
                <span className="text-mine-text">{log.action}</span>
                <span className="text-mine-muted text-xs truncate flex-1">{log.detail}</span>
                <span className="text-mine-muted font-din text-xs ml-auto shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
