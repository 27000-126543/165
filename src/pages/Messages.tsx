import { useState } from 'react';
import {
  ShieldCheck, AlertTriangle, Cog, FlaskConical,
  CalendarClock, Siren, FileBarChart, Download,
  Bell, ChevronRight, User, Users
} from 'lucide-react';
import { messages as initialMessages } from '@/data/finance';
import type { Message } from '@/types';

const typeConfig: Record<string, { label: string; icon: typeof ShieldCheck; color: string }> = {
  access: { label: '准入', icon: ShieldCheck, color: 'text-mine-blue' },
  alarm: { label: '预警', icon: AlertTriangle, color: 'text-mine-amber' },
  fault: { label: '故障', icon: Cog, color: 'text-mine-red' },
  quality: { label: '质量', icon: FlaskConical, color: 'text-mine-cyan' },
  dispatch: { label: '调度', icon: CalendarClock, color: 'text-mine-green' },
  emergency: { label: '应急', icon: Siren, color: 'text-mine-red' },
  report: { label: '报表', icon: FileBarChart, color: 'text-mine-blue' },
};

const levelConfig: Record<string, { color: string; bg: string }> = {
  info: { color: 'text-mine-blue', bg: 'bg-mine-blue/10' },
  warning: { color: 'text-mine-amber', bg: 'bg-mine-amber/10' },
  error: { color: 'text-mine-red', bg: 'bg-mine-red/10' },
  critical: { color: 'text-mine-red', bg: 'bg-mine-red/20' },
};

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'access', label: '准入' },
  { key: 'alarm', label: '预警' },
  { key: 'fault', label: '故障' },
  { key: 'quality', label: '质量' },
  { key: 'dispatch', label: '调度' },
  { key: 'emergency', label: '应急' },
  { key: 'report', label: '报表' },
];

export default function Messages() {
  const [msgList, setMsgList] = useState<Message[]>(initialMessages);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activeTab === 'all' ? msgList : msgList.filter((m) => m.type === activeTab);

  const getUnreadCount = (type: string) => {
    const list = type === 'all' ? msgList : msgList.filter((m) => m.type === type);
    return list.filter((m) => !m.read).length;
  };

  const markAsRead = (id: string) => {
    setMsgList((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      <div className="w-48 space-y-1 shrink-0">
        {tabs.map((tab) => {
          const unread = getUnreadCount(tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setExpandedId(null); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === tab.key
                  ? 'bg-mine-cyan/10 text-mine-cyan border border-mine-cyan/20'
                  : 'text-mine-muted hover:text-mine-text hover:bg-mine-card'
              }`}
            >
              <span>{tab.label}</span>
              {unread > 0 && (
                <span className="bg-mine-red/20 text-mine-red text-xs px-1.5 py-0.5 rounded-full font-din">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex gap-4 min-w-0">
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
              return (
                <div
                  key={msg.id}
                  className={`mine-card cursor-pointer transition-all ${isExpanded ? 'ring-1 ring-mine-cyan/30' : ''}`}
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
                          {msg.level === 'info' ? '信息' : msg.level === 'warning' ? '警告' : msg.level === 'error' ? '错误' : '紧急'}
                        </span>
                        {!msg.read && (
                          <span className="w-2 h-2 bg-mine-red rounded-full shrink-0" />
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
                      <div className="flex gap-3 pt-2">
                        {!msg.read && (
                          <button
                            onClick={() => markAsRead(msg.id)}
                            className="mine-btn-outline text-xs py-1"
                          >
                            标记已读
                          </button>
                        )}
                        {msg.hasVoucher && msg.voucherUrl && (
                          <a
                            href={msg.voucherUrl}
                            className="mine-btn-primary text-xs py-1 flex items-center gap-1"
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
