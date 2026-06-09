import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, Cog, FlaskConical,
  CalendarClock, Siren, FileBarChart, Download,
  Bell, ChevronRight, User, Users, CheckCircle2,
  Filter, CheckCheck, ExternalLink, ThumbsUp, X,
  Inbox, Clock, ClipboardCheck, Archive
} from 'lucide-react';
import { useAppStore } from '@/store';

const typeConfig: Record<string, { label: string; icon: typeof ShieldCheck; color: string }> = {
  access: { label: '准入', icon: ShieldCheck, color: 'text-mine-blue' },
  alarm: { label: '预警', icon: AlertTriangle, color: 'text-mine-amber' },
  fault: { label: '故障', icon: Cog, color: 'text-mine-red' },
  quality: { label: '质量', icon: FlaskConical, color: 'text-mine-cyan' },
  dispatch: { label: '调度', icon: CalendarClock, color: 'text-mine-green' },
  drill: { label: '演练', icon: CalendarClock, color: 'text-mine-amber' },
  emergency: { label: '应急', icon: Siren, color: 'text-mine-red' },
  report: { label: '报表', icon: FileBarChart, color: 'text-mine-blue' },
  approval: { label: '审批', icon: ThumbsUp, color: 'text-mine-amber' },
};

const levelConfig: Record<string, { color: string; bg: string; label: string }> = {
  info: { color: 'text-mine-blue', bg: 'bg-mine-blue/10', label: '信息' },
  warning: { color: 'text-mine-amber', bg: 'bg-mine-amber/10', label: '警告' },
  error: { color: 'text-mine-red', bg: 'bg-mine-red/10', label: '错误' },
  critical: { color: 'text-mine-red', bg: 'bg-mine-red/20', label: '紧急' },
};

const queueTabs = [
  { key: 'unread', label: '未读', icon: Inbox, iconColor: 'text-mine-cyan' },
  { key: 'pendingConfirm', label: '待确认', icon: Clock, iconColor: 'text-mine-amber' },
  { key: 'pendingApproval', label: '待审批', icon: ClipboardCheck, iconColor: 'text-mine-blue' },
  { key: 'processed', label: '已处理', icon: Archive, iconColor: 'text-mine-green' },
];

const levelFilters = [
  { key: 'all', label: '全部级别' },
  { key: 'critical', label: '紧急' },
  { key: 'error', label: '错误' },
  { key: 'warning', label: '警告' },
  { key: 'info', label: '信息' },
];

const rejectPresetReasons = ['数据有误', '利润计算偏差', '需补充说明', '其他'];

export default function Messages() {
  const navigate = useNavigate();
  const messages = useAppStore((s) => s.messages);
  const readMessageIds = useAppStore((s) => s.readMessageIds);
  const markMessageRead = useAppStore((s) => s.markMessageRead);
  const markAllRead = useAppStore((s) => s.markAllRead);
  const confirmMessage = useAppStore((s) => s.confirmMessage);
  const approveReport = useAppStore((s) => s.approveReport);
  const rejectReport = useAppStore((s) => s.rejectReport);

  const [activeTab, setActiveTab] = useState('unread');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState('all');
  const [senderFilter, setSenderFilter] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const isRead = (id: string) => readMessageIds.includes(id);

  const unreadList = useMemo(() => messages.filter((m) => !isRead(m.id)), [messages, readMessageIds]);

  const pendingConfirmList = useMemo(
    () => messages.filter((m) => (m.level === 'critical' || m.level === 'error') && !m.confirmedBy),
    [messages]
  );

  const pendingApprovalList = useMemo(
    () => messages.filter((m) => m.type === 'approval' && !isRead(m.id)),
    [messages, readMessageIds]
  );

  const processedList = useMemo(
    () =>
      messages.filter((m) => {
        const read = isRead(m.id);
        if (!read) return false;
        if ((m.level === 'critical' || m.level === 'error') && !m.confirmedBy) return false;
        if (m.type === 'approval' && !isRead(m.id)) return false;
        return true;
      }),
    [messages, readMessageIds]
  );

  const queueCounts = useMemo(
    () => ({
      unread: unreadList.length,
      pendingConfirm: pendingConfirmList.length,
      pendingApproval: pendingApprovalList.length,
      processed: processedList.length,
    }),
    [unreadList, pendingConfirmList, pendingApprovalList, processedList]
  );

  const activeList = useMemo(() => {
    switch (activeTab) {
      case 'unread': return unreadList;
      case 'pendingConfirm': return pendingConfirmList;
      case 'pendingApproval': return pendingApprovalList;
      case 'processed': return processedList;
      default: return unreadList;
    }
  }, [activeTab, unreadList, pendingConfirmList, pendingApprovalList, processedList]);

  const filtered = useMemo(() => {
    let list = activeList;
    if (levelFilter !== 'all') {
      list = list.filter((m) => m.level === levelFilter);
    }
    if (senderFilter.trim()) {
      const kw = senderFilter.trim().toLowerCase();
      list = list.filter((m) => m.sender.toLowerCase().includes(kw));
    }
    return list;
  }, [activeList, levelFilter, senderFilter]);

  const handleApprove = (msgId: string) => {
    approveReport();
    markMessageRead(msgId);
  };

  const handleReject = (msgId: string) => {
    if (!rejectReason.trim()) return;
    rejectReport(rejectReason.trim());
    markMessageRead(msgId);
    setRejectingId(null);
    setRejectReason('');
  };

  const handleSelectPresetReason = (reason: string) => {
    if (reason === '其他') {
      setRejectReason('');
    } else {
      setRejectReason(reason);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      <div className="w-52 space-y-1 shrink-0">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-mine-text text-sm font-medium">通知处理台</span>
          <button
            onClick={() => markAllRead()}
            className="text-mine-cyan text-xs hover:underline flex items-center gap-1"
            title="全部标记已读"
          >
            <CheckCheck size={12} />全部已读
          </button>
        </div>
        {queueTabs.map((tab) => {
          const count = queueCounts[tab.key as keyof typeof queueCounts];
          const QIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setExpandedId(null); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
                activeTab === tab.key
                  ? 'bg-mine-cyan/10 text-mine-cyan border border-mine-cyan/20'
                  : 'text-mine-muted hover:text-mine-text hover:bg-mine-card'
              }`}
            >
              <span className="flex items-center gap-2">
                <QIcon size={16} className={activeTab === tab.key ? 'text-mine-cyan' : tab.iconColor} />
                {tab.label}
              </span>
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-din ${
                  tab.key === 'unread' ? 'bg-mine-cyan/15 text-mine-cyan' :
                  tab.key === 'pendingConfirm' ? 'bg-mine-red/20 text-mine-red' :
                  tab.key === 'pendingApproval' ? 'bg-mine-blue/15 text-mine-blue' :
                  'bg-mine-green/15 text-mine-green'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <div className="border-t border-mine-border my-3" />

        <div className="px-2 mb-2">
          <span className="text-mine-muted text-xs">消息类型</span>
        </div>
        {Object.entries(typeConfig).map(([key, cfg]) => {
          const typeCount = messages.filter((m) => m.type === key && !isRead(m.id)).length;
          const TIcon = cfg.icon;
          return (
            <div
              key={key}
              className="flex items-center justify-between px-4 py-1.5 text-xs text-mine-muted"
            >
              <span className="flex items-center gap-1.5">
                <TIcon size={12} className={cfg.color} />
                {cfg.label}
              </span>
              {typeCount > 0 && (
                <span className="bg-mine-red/20 text-mine-red text-xs px-1 py-0.5 rounded-full font-din">
                  {typeCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-mine-muted" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-mine-card border border-mine-border rounded-lg px-3 py-1.5 text-sm text-mine-text focus:outline-none focus:border-mine-cyan/50"
            >
              {levelFilters.map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={senderFilter}
            onChange={(e) => setSenderFilter(e.target.value)}
            placeholder="搜索发送人..."
            className="bg-mine-card border border-mine-border rounded-lg px-3 py-1.5 text-sm text-mine-text placeholder:text-mine-muted focus:outline-none focus:border-mine-cyan/50 w-48"
          />
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
          {filtered.length === 0 ? (
            <div className="mine-card text-center text-mine-muted py-12">
              <Bell size={32} className="mx-auto mb-2 opacity-40" />
              暂无消息
            </div>
          ) : (
            filtered.map((msg) => {
              const tCfg = typeConfig[msg.type];
              const lCfg = levelConfig[msg.level];
              const Icon = tCfg.icon;
              const isExpanded = expandedId === msg.id;
              const msgRead = isRead(msg.id);
              return (
                <div
                  key={msg.id}
                  className={`mine-card cursor-pointer transition-all ${isExpanded ? 'ring-1 ring-mine-cyan/30' : ''} ${!msgRead ? 'border-l-2 border-l-mine-cyan' : ''}`}
                  onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${tCfg.color} mt-0.5`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-mine-text text-sm font-medium truncate">{msg.title}</span>
                        <span className={`${lCfg.color} ${lCfg.bg} text-xs px-1.5 py-0.5 rounded`}>
                          {lCfg.label}
                        </span>
                        {!msgRead && (
                          <span className="w-2 h-2 bg-mine-cyan rounded-full shrink-0" />
                        )}
                        {msg.confirmedBy && (
                          <span className="text-mine-green text-xs flex items-center gap-0.5">
                            <CheckCircle2 size={10} />已确认
                          </span>
                        )}
                      </div>
                      <div className="text-mine-muted text-xs mt-1 truncate">{msg.content}</div>
                      <div className="text-mine-muted text-xs mt-1.5 font-din">{msg.timestamp}</div>
                    </div>
                    <ChevronRight size={14} className={`text-mine-muted shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-mine-border space-y-3" onClick={(e) => e.stopPropagation()}>
                      <p className="text-mine-text text-sm leading-relaxed">{msg.content}</p>
                      <div className="flex items-center gap-2 text-xs text-mine-muted">
                        <User size={12} /> 发送者: {msg.sender}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-mine-muted">
                        <Users size={12} /> 接收者: {msg.recipients.join('、')}
                      </div>
                      {msg.sourceOperator && msg.sourceTimestamp && (
                        <div className="flex items-center gap-2 text-xs text-mine-muted">
                          <ExternalLink size={12} /> 来源操作人: {msg.sourceOperator} | 操作时间: {msg.sourceTimestamp}
                        </div>
                      )}
                      {msg.confirmedBy && (
                        <div className="flex items-center gap-2 text-xs text-mine-green">
                          <CheckCircle2 size={12} /> 确认人: {msg.confirmedBy} | 确认时间: {msg.confirmedAt}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 pt-2">
                        {!msgRead && (
                          <button
                            onClick={() => markMessageRead(msg.id)}
                            className="mine-btn-outline text-xs py-1"
                          >
                            标记已读
                          </button>
                        )}
                        {(msg.level === 'critical' || msg.level === 'error') && !msg.confirmedBy && (
                          <button
                            onClick={() => confirmMessage(msg.id)}
                            className="mine-btn-primary text-xs py-1 flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} />确认告警
                          </button>
                        )}
                        {msg.type === 'approval' && !msgRead && (
                          <>
                            <button
                              onClick={() => handleApprove(msg.id)}
                              className="mine-btn-primary text-xs py-1 flex items-center gap-1"
                            >
                              <ThumbsUp size={12} />通过
                            </button>
                            {rejectingId === msg.id ? (
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-1.5">
                                  {rejectPresetReasons.map((reason) => (
                                    <button
                                      key={reason}
                                      onClick={() => handleSelectPresetReason(reason)}
                                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                        rejectReason === reason
                                          ? 'border-mine-red/50 bg-mine-red/10 text-mine-red'
                                          : 'border-mine-border text-mine-muted hover:text-mine-text hover:border-mine-red/30'
                                      }`}
                                    >
                                      {reason}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="输入驳回原因..."
                                    className="bg-mine-bg border border-mine-red/50 rounded px-2 py-1 text-xs text-mine-text focus:outline-none w-40"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleReject(msg.id)}
                                    className="mine-btn-danger text-xs py-1"
                                  >
                                    确认驳回
                                  </button>
                                  <button
                                    onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                    className="text-mine-muted text-xs"
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setRejectingId(msg.id)}
                                className="mine-btn-danger text-xs py-1 flex items-center gap-1"
                              >
                                <X size={12} />驳回
                              </button>
                            )}
                          </>
                        )}
                        {msg.relatedRoute && (
                          <button
                            onClick={() => navigate(`${msg.relatedRoute}?highlight=${msg.relatedId}`)}
                            className="mine-btn-outline text-xs py-1 flex items-center gap-1"
                          >
                            <ExternalLink size={12} />查看详情
                          </button>
                        )}
                        {msg.hasVoucher && msg.voucherUrl && (
                          <a
                            href={msg.voucherUrl}
                            className="mine-btn-outline text-xs py-1 flex items-center gap-1"
                          >
                            <Download size={12} /> 下载凭证
                          </a>
                        )}
                        <button
                          onClick={() => setExpandedId(null)}
                          className="text-mine-muted text-xs py-1 hover:text-mine-text"
                        >
                          收起
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
