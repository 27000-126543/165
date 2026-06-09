import { useState } from 'react';
import { Radio, AlertTriangle, FileText, X, MapPin, Volume2, Clock } from 'lucide-react';
import { emergencyEvents } from '@/data/environment';

const levelConfig = {
  warning: { label: '预警', color: 'text-mine-amber', bg: 'bg-mine-amber/10', border: 'border-mine-amber/30' },
  critical: { label: '严重', color: 'text-mine-red', bg: 'bg-mine-red/10', border: 'border-mine-red/30' },
  emergency: { label: '紧急', color: 'text-mine-red', bg: 'bg-mine-red/20', border: 'border-mine-red/50' },
};

const typeLabels: Record<string, string> = {
  gas_over: '瓦斯超标',
  dust_over: '粉尘超标',
  collapse: '坍塌',
  flood: '水害',
};

export default function Emergency() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const activeEvents = emergencyEvents.filter((e) => e.status === 'active');
  const resolvedEvents = emergencyEvents.filter((e) => e.status === 'resolved');

  const handleBroadcast = () => {
    setShowConfirm(false);
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-mine-text text-lg font-medium">应急管理</h2>
        <button
          onClick={() => setShowConfirm(true)}
          className="mine-btn-danger flex items-center gap-2 text-base px-6 py-3"
        >
          <Radio size={20} className="animate-pulse" />
          触发应急广播
        </button>
      </div>

      {broadcastSent && (
        <div className="bg-mine-red/10 border border-mine-red/30 text-mine-red text-sm px-4 py-3 rounded-lg animate-slide-up">
          应急广播已触发，所有井下人员请立即注意撤离指令！
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-mine-card border border-mine-border rounded-xl p-6 w-[420px] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-mine-red font-medium text-lg flex items-center gap-2">
                <AlertTriangle size={20} /> 确认触发应急广播
              </h3>
              <button onClick={() => setShowConfirm(false)} className="text-mine-muted hover:text-mine-text">
                <X size={18} />
              </button>
            </div>
            <p className="text-mine-muted text-sm">
              触发应急广播将向所有井下人员发送紧急通知，请确认是否继续操作？
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowConfirm(false)} className="mine-btn-outline text-sm">取消</button>
              <button onClick={handleBroadcast} className="mine-btn-danger text-sm">确认触发</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="text-mine-text font-medium mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-mine-red" />
          活跃应急事件
        </div>
        {activeEvents.length === 0 ? (
          <div className="mine-card text-mine-muted text-center py-8">当前无活跃应急事件</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {activeEvents.map((event) => {
              const lCfg = levelConfig[event.level];
              return (
                <div key={event.id} className="mine-card space-y-3 border-l-4 border-l-mine-red">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${lCfg.bg} ${lCfg.color} ${lCfg.border} border`}>
                        {lCfg.label}
                      </span>
                      <span className="text-mine-muted text-xs">{typeLabels[event.type]}</span>
                    </div>
                    <span className="text-mine-muted text-xs flex items-center gap-1">
                      <Clock size={12} /> {event.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-mine-text">
                    <MapPin size={14} className="text-mine-cyan" />
                    {event.location}
                  </div>
                  <p className="text-mine-muted text-sm">{event.description}</p>
                  {event.evacuationZones.length > 0 && (
                    <div className="text-xs">
                      <span className="text-mine-amber">撤离区域: </span>
                      <span className="text-mine-text">{event.evacuationZones.join('、')}</span>
                    </div>
                  )}
                  <div className="bg-mine-bg rounded p-2 text-xs">
                    <div className="flex items-center gap-1 text-mine-cyan mb-1">
                      <Volume2 size={12} /> 广播内容
                    </div>
                    <p className="text-mine-text">{event.broadcastContent}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="text-mine-text font-medium mb-3 flex items-center gap-2">
          <FileText size={16} className="text-mine-green" />
          已结束应急事件
        </div>
        <div className="grid grid-cols-2 gap-4">
          {resolvedEvents.map((event) => (
            <div key={event.id} className="mine-card space-y-2 opacity-80">
              <div className="flex items-center justify-between">
                <span className="text-mine-muted text-xs">{typeLabels[event.type]}</span>
                <span className="text-mine-muted text-xs">{event.timestamp}</span>
              </div>
              <p className="text-mine-text text-sm">{event.description}</p>
              {event.reportUrl && (
                <a
                  href={event.reportUrl}
                  className="text-mine-cyan text-xs hover:underline flex items-center gap-1"
                >
                  <FileText size={12} /> 查看事件报告
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-mine-text font-medium mb-3">应急事件历史</div>
        <div className="mine-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mine-border">
                <th className="text-left text-mine-muted py-3 px-4 font-medium">事件ID</th>
                <th className="text-left text-mine-muted py-3 px-4 font-medium">类型</th>
                <th className="text-left text-mine-muted py-3 px-4 font-medium">等级</th>
                <th className="text-left text-mine-muted py-3 px-4 font-medium">位置</th>
                <th className="text-left text-mine-muted py-3 px-4 font-medium">时间</th>
                <th className="text-left text-mine-muted py-3 px-4 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {emergencyEvents.map((event) => {
                const lCfg = levelConfig[event.level];
                return (
                  <tr key={event.id} className="border-b border-mine-border/50 hover:bg-mine-bg/50">
                    <td className="text-mine-cyan py-3 px-4 font-din">{event.id}</td>
                    <td className="text-mine-text py-3 px-4">{typeLabels[event.type]}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${lCfg.bg} ${lCfg.color}`}>{lCfg.label}</span>
                    </td>
                    <td className="text-mine-text py-3 px-4">{event.location}</td>
                    <td className="text-mine-muted py-3 px-4 font-din">{event.timestamp}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          event.status === 'active'
                            ? 'bg-mine-red/10 text-mine-red'
                            : 'bg-mine-green/10 text-mine-green'
                        }`}
                      >
                        {event.status === 'active' ? '活跃' : '已结束'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
