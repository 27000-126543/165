import { useState, useEffect, useRef } from 'react';
import { Radio, AlertTriangle, FileText, X, MapPin, Volume2, Clock, Users, CheckCircle, ChevronDown, ChevronUp, Download, ShieldCheck, Zap } from 'lucide-react';
import { useAppStore } from '@/store';

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

const statusLabels: Record<string, { label: string; cls: string }> = {
  active: { label: '活跃', cls: 'bg-mine-red/10 text-mine-red' },
  disposal: { label: '处置中', cls: 'bg-mine-amber/10 text-mine-amber' },
  resolved: { label: '已结束', cls: 'bg-mine-green/10 text-mine-green' },
};

export default function Emergency() {
  const emergencyEvents = useAppStore((s) => s.emergencyEvents);
  const triggerBroadcast = useAppStore((s) => s.triggerBroadcast);
  const updateEmergencyDisposal = useAppStore((s) => s.updateEmergencyDisposal);
  const toggleDisposalStep = useAppStore((s) => s.toggleDisposalStep);
  const closeEmergency = useAppStore((s) => s.closeEmergency);
  const createDrillPlan = useAppStore((s) => s.createDrillPlan);

  const [showConfirm, setShowConfirm] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [evacInput, setEvacInput] = useState<Record<string, string>>({});
  const [teamInput, setTeamInput] = useState<Record<string, string>>({});
  const [closeConfirmId, setCloseConfirmId] = useState<string | null>(null);
  const [drillSuccessId, setDrillSuccessId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hl = params.get('highlight');
    if (hl) {
      setHighlightId(hl);
    }
  }, []);

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId]);

  const activeEvents = emergencyEvents.filter((e) => e.status === 'active' || e.status === 'disposal');
  const resolvedEvents = emergencyEvents.filter((e) => e.status === 'resolved');

  const isExpanded = (eventId: string) => {
    if (expandedId === eventId) return true;
    if (highlightId === eventId && expandedId === null) return true;
    return false;
  };

  const handleTopBroadcast = () => {
    if (activeEvents.length === 0) {
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 3000);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmBroadcast = () => {
    setShowConfirm(false);
    triggerBroadcast(activeEvents[0].id);
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  const handleSaveEvac = (eventId: string) => {
    const count = Number(evacInput[eventId] || 0);
    const teams = (teamInput[eventId] || '').split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
    updateEmergencyDisposal(eventId, {
      evacuationCount: isNaN(count) ? 0 : count,
      notifiedTeams: teams.length > 0 ? teams : undefined,
    });
  };

  const handleClose = (eventId: string) => {
    closeEmergency(eventId);
    setCloseConfirmId(null);
    setExpandedId(null);
  };

  const handleCreateDrill = (eventId: string) => {
    createDrillPlan(eventId);
    setDrillSuccessId(eventId);
    setTimeout(() => setDrillSuccessId(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-mine-text text-lg font-medium">应急管理</h2>
        <button
          onClick={handleTopBroadcast}
          className="mine-btn-danger flex items-center gap-2 text-base px-6 py-3"
        >
          <Radio size={20} className="animate-pulse" />
          触发应急广播
        </button>
      </div>

      {broadcastSent && (
        <div className={`border text-sm px-4 py-3 rounded-lg animate-slide-up ${
          activeEvents.length === 0
            ? 'bg-mine-amber/10 border-mine-amber/30 text-mine-amber'
            : 'bg-mine-red/10 border-mine-red/30 text-mine-red'
        }`}>
          {activeEvents.length === 0
            ? '当前无活跃应急事件，无法触发应急广播'
            : '应急广播已触发，所有井下人员请立即注意撤离指令！'}
        </div>
      )}

      {drillSuccessId && (
        <div className="border text-sm px-4 py-3 rounded-lg animate-slide-up bg-mine-green/10 border-mine-green/30 text-mine-green">
          演练计划已生成！基于事件 {drillSuccessId} 的演练计划已创建并通知相关人员。
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
              <button onClick={handleConfirmBroadcast} className="mine-btn-danger text-sm">确认触发</button>
            </div>
          </div>
        </div>
      )}

      {closeConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-mine-card border border-mine-border rounded-xl p-6 w-[420px] space-y-4">
            <h3 className="text-mine-amber font-medium text-lg flex items-center gap-2">
              <ShieldCheck size={20} /> 确认关闭应急事件
            </h3>
            <p className="text-mine-muted text-sm">
              关闭事件后将自动生成事故报告，并发送安全复盘通知给相关人员，确认继续？
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCloseConfirmId(null)} className="mine-btn-outline text-sm">取消</button>
              <button onClick={() => handleClose(closeConfirmId)} className="mine-btn-primary text-sm">确认关闭</button>
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
              const expanded = isExpanded(event.id);
              const isHighlighted = highlightId === event.id;
              const steps = event.disposalSteps || [];
              const doneSteps = steps.filter((s) => s.done).length;
              return (
                <div key={event.id} ref={isHighlighted ? highlightRef : undefined} className={`mine-card space-y-3 border-l-4 border-l-mine-red transition-all ${isHighlighted ? 'ring-2 ring-mine-cyan/50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${lCfg.bg} ${lCfg.color} ${lCfg.border} border`}>
                        {lCfg.label}
                      </span>
                      <span className="text-mine-muted text-xs">{typeLabels[event.type]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${statusLabels[event.status].cls}`}>
                        {statusLabels[event.status].label}
                      </span>
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerBroadcast(event.id)}
                      className="mine-btn-danger text-xs flex items-center gap-1 py-1"
                    >
                      <Radio size={12} /> 触发广播
                    </button>
                    <button
                      onClick={() => setExpandedId(expanded ? null : event.id)}
                      className="mine-btn-outline text-xs flex items-center gap-1 py-1"
                    >
                      {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {expanded ? '收起处置' : '处置流程'}
                    </button>
                  </div>

                  {expanded && (
                    <div className="space-y-4 pt-3 border-t border-mine-border" onClick={(e) => e.stopPropagation()}>
                      <div>
                        <div className="text-mine-text text-xs font-medium mb-2">处置步骤进度 ({doneSteps}/{steps.length})</div>
                        <div className="space-y-1.5">
                          {steps.map((step, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 cursor-pointer group"
                              onClick={() => toggleDisposalStep(event.id, idx)}
                            >
                              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                                step.done ? 'bg-mine-green/20' : 'bg-mine-border/50'
                              }`}>
                                {step.done ? (
                                  <CheckCircle size={14} className="text-mine-green" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-mine-muted/50" />
                                )}
                              </div>
                              <span className={`text-sm ${step.done ? 'text-mine-green' : 'text-mine-muted'} group-hover:text-mine-text transition-colors`}>
                                {step.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-mine-muted text-xs mb-1">疏散人数</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={evacInput[event.id] ?? event.evacuationCount ?? ''}
                              onChange={(e) => setEvacInput({ ...evacInput, [event.id]: e.target.value })}
                              placeholder="0"
                              className="flex-1 bg-mine-bg border border-mine-border rounded px-2 py-1 text-sm text-mine-text focus:outline-none focus:border-mine-cyan/50"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-mine-muted text-xs mb-1">已通知班组</label>
                          <input
                            type="text"
                            value={teamInput[event.id] ?? (event.notifiedTeams || []).join('、')}
                            onChange={(e) => setTeamInput({ ...teamInput, [event.id]: e.target.value })}
                            placeholder="采掘一班、运输班..."
                            className="w-full bg-mine-bg border border-mine-border rounded px-2 py-1 text-sm text-mine-text focus:outline-none focus:border-mine-cyan/50"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEvac(event.id)}
                          className="mine-btn-outline text-xs py-1"
                        >
                          保存处置信息
                        </button>
                        {doneSteps === steps.length && steps.length > 0 && (
                          <button
                            onClick={() => setCloseConfirmId(event.id)}
                            className="mine-btn-primary text-xs py-1 flex items-center gap-1"
                          >
                            <ShieldCheck size={12} />关闭事件
                          </button>
                        )}
                      </div>

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
                  )}
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
        {resolvedEvents.length === 0 ? (
          <div className="mine-card text-mine-muted text-center py-6">暂无已结束事件</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {resolvedEvents.map((event) => {
              const steps = event.disposalSteps || [];
              const isHighlighted = highlightId === event.id;
              return (
                <div key={event.id} ref={isHighlighted ? highlightRef : undefined} className={`mine-card space-y-3 opacity-80 transition-all ${isHighlighted ? 'ring-2 ring-mine-cyan/50 opacity-100' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-mine-muted text-xs">{typeLabels[event.type]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${statusLabels.resolved.cls}`}>
                        {statusLabels.resolved.label}
                      </span>
                    </div>
                    <span className="text-mine-muted text-xs">{event.timestamp}</span>
                  </div>
                  <p className="text-mine-text text-sm">{event.description}</p>

                  {event.closedBy && (
                    <div className="text-xs text-mine-muted">
                      关闭人: {event.closedBy} | 关闭时间: {event.closedAt}
                    </div>
                  )}

                  <div className="border-t border-mine-border pt-2 space-y-2">
                    <div className="text-mine-text text-xs font-medium flex items-center gap-1 mb-1">
                      <ShieldCheck size={12} className="text-mine-green" /> 复盘详情
                    </div>

                    {event.disposalDuration && (
                      <div className="flex items-center gap-2 text-xs">
                        <Clock size={12} className="text-mine-cyan" />
                        <span className="text-mine-muted">处置耗时:</span>
                        <span className="text-mine-text">{event.disposalDuration}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs">
                      <Users size={12} className="text-mine-cyan" />
                      <span className="text-mine-muted">疏散人数:</span>
                      <span className="text-mine-text">{event.evacuationCount ?? 0}人</span>
                    </div>

                    {event.notifiedTeams && event.notifiedTeams.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <Volume2 size={12} className="text-mine-cyan" />
                        <span className="text-mine-muted">已通知班组:</span>
                        <span className="text-mine-text">{event.notifiedTeams.join('、')}</span>
                      </div>
                    )}

                    {steps.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-mine-muted text-xs">处置步骤:</div>
                        {steps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <span className={step.done ? 'text-mine-green' : 'text-mine-red'}>
                              {step.done ? '✓' : '✗'}
                            </span>
                            <span className={step.done ? 'text-mine-text' : 'text-mine-muted'}>{step.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {event.reviewConclusion && (
                      <div className="bg-mine-bg rounded p-2 text-xs">
                        <div className="text-mine-amber mb-1">复盘结论:</div>
                        <p className="text-mine-text">{event.reviewConclusion}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleCreateDrill(event.id)}
                      className="mine-btn-primary text-xs flex items-center gap-1 py-1"
                    >
                      <Zap size={12} /> 一键生成演练计划
                    </button>
                    {event.reportUrl && (
                      <a
                        href={event.reportUrl}
                        download
                        className="text-mine-cyan text-xs hover:underline flex items-center gap-1"
                      >
                        <Download size={12} /> 下载事故报告
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                <th className="text-left text-mine-muted py-3 px-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {emergencyEvents.map((event) => {
                const lCfg = levelConfig[event.level];
                const sCfg = statusLabels[event.status];
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
                      <span className={`text-xs px-2 py-0.5 rounded ${sCfg.cls}`}>{sCfg.label}</span>
                    </td>
                    <td className="py-3 px-4">
                      {event.status === 'resolved' && event.reportUrl ? (
                        <a href={event.reportUrl} download className="text-mine-cyan text-xs hover:underline flex items-center gap-1">
                          <Download size={12} />报告
                        </a>
                      ) : (
                        <span className="text-mine-muted text-xs">—</span>
                      )}
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
