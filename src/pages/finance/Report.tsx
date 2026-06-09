import { useState, useMemo } from 'react';
import { DollarSign, FileText, Send, Download, Check, ThumbsUp, X, History, AlertCircle } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '@/store';

const approvalCfg: Record<string, { label: string; cls: string; color: string }> = {
  draft: { label: '草稿', cls: 'bg-mine-border/50 text-mine-muted', color: 'text-mine-muted' },
  pending: { label: '待审批', cls: 'bg-mine-amber/20 text-mine-amber', color: 'text-mine-amber' },
  approved: { label: '已通过', cls: 'bg-mine-green/20 text-mine-green', color: 'text-mine-green' },
  rejected: { label: '已驳回', cls: 'bg-mine-red/20 text-mine-red', color: 'text-mine-red' },
};

export default function Report() {
  const report = useAppStore((s) => s.financeReports[0]);
  const generateReport = useAppStore((s) => s.generateReport);
  const pushReportToManagement = useAppStore((s) => s.pushReportToManagement);
  const approveReport = useAppStore((s) => s.approveReport);
  const rejectReport = useAppStore((s) => s.rejectReport);
  const exportPdf = useAppStore((s) => s.exportPdf);
  const allAuditLogs = useAppStore((s) => s.auditLogs);
  const auditLogs = useMemo(() => allAuditLogs.filter((l) => l.targetType === 'report').slice(0, 10), [allAuditLogs]);

  const [generated, setGenerated] = useState(false);
  const [pushed, setPushed] = useState(false);
  const [exported, setExported] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!report) return null;

  const approval = approvalCfg[report.approvalStatus] || approvalCfg.draft;

  const statCards = [
    { label: '总收入', value: `${(report.totalRevenue / 10000).toFixed(1)}万`, color: 'text-mine-green' },
    { label: '总成本', value: `${(report.totalCost / 10000).toFixed(1)}万`, color: 'text-mine-red' },
    { label: '利润', value: `${(report.profit / 10000).toFixed(1)}万`, color: 'text-mine-cyan' },
    { label: '利润率', value: `${report.profitMargin}%`, color: 'text-mine-amber' },
  ];

  const revenueCostOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#7A8BA0' },
    tooltip: { trigger: 'axis', backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' } },
    legend: { data: ['收入', '成本'], textStyle: { color: '#7A8BA0' }, top: 0 },
    grid: { top: 40, right: 20, bottom: 30, left: 60 },
    xAxis: {
      type: 'category',
      data: [report.period],
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
    },
    yAxis: {
      type: 'value',
      name: '金额(万元)',
      nameTextStyle: { color: '#7A8BA0' },
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
      splitLine: { lineStyle: { color: '#1A2A42' } },
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        barWidth: '35%',
        itemStyle: { color: '#00D68F' },
        data: [(report.totalRevenue / 10000).toFixed(1)],
      },
      {
        name: '成本',
        type: 'bar',
        barWidth: '35%',
        itemStyle: { color: '#FF3B3B' },
        data: [(report.totalCost / 10000).toFixed(1)],
      },
    ],
  };

  const profitTrendOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#7A8BA0' },
    tooltip: { trigger: 'axis', backgroundColor: '#1A2A42', borderColor: '#243352', textStyle: { color: '#E0E8F0' } },
    grid: { top: 20, right: 20, bottom: 30, left: 60 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', report.period],
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
    },
    yAxis: {
      type: 'value',
      name: '利润率(%)',
      nameTextStyle: { color: '#7A8BA0' },
      axisLine: { lineStyle: { color: '#243352' } },
      axisLabel: { color: '#7A8BA0' },
      splitLine: { lineStyle: { color: '#1A2A42' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#FFB800', width: 2 },
        itemStyle: { color: '#FFB800', borderColor: '#1A2A42', borderWidth: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,184,0,0.3)' }, { offset: 1, color: 'rgba(255,184,0,0)' }] } },
        data: [36.2, 38.1, 37.5, 39.0, report.profitMargin],
      },
    ],
  };

  const handleGenerate = () => {
    generateReport();
    setGenerated(true);
    setTimeout(() => setGenerated(false), 3000);
  };

  const handlePush = () => {
    pushReportToManagement();
    setPushed(true);
    setTimeout(() => setPushed(false), 3000);
  };

  const handleApprove = () => {
    approveReport();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectReport(rejectReason.trim());
    setShowReject(false);
    setRejectReason('');
  };

  const handleExport = () => {
    exportPdf();
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="mine-card flex items-center gap-4">
            <div className={card.color}><DollarSign size={24} /></div>
            <div>
              <div className={`stat-value ${card.color}`}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
        <div className="mine-card flex items-center gap-4">
          <div className={approval.color}><FileText size={24} /></div>
          <div>
            <div className={`stat-value ${approval.color}`}>
              <span className={`text-xs px-2 py-0.5 rounded ${approval.cls}`}>{approval.label}</span>
            </div>
            <div className="stat-label">审批状态</div>
          </div>
        </div>
      </div>

      {report.approvalStatus === 'rejected' && report.rejectReason && (
        <div className="bg-mine-red/10 border border-mine-red/30 text-mine-red text-sm px-4 py-3 rounded-lg flex items-center gap-2 animate-slide-up">
          <AlertCircle size={16} />
          <span>驳回原因：{report.rejectReason}</span>
          {report.approvedBy && <span className="ml-2 text-xs opacity-70">({report.approvedBy} | {report.approvedAt})</span>}
        </div>
      )}

      {report.approvalStatus === 'approved' && report.approvedBy && (
        <div className="bg-mine-green/10 border border-mine-green/30 text-mine-green text-sm px-4 py-3 rounded-lg flex items-center gap-2 animate-slide-up">
          <ThumbsUp size={16} />
          <span>审批已通过</span>
          <span className="text-xs opacity-70">({report.approvedBy} | {report.approvedAt})</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="mine-card flex flex-col items-center justify-center py-8">
          <div className="text-mine-muted text-xs mb-2">净利润</div>
          <div className="text-mine-cyan font-din text-5xl font-bold">{(report.profit / 10000).toFixed(1)}</div>
          <div className="text-mine-muted text-sm mt-1">万元</div>
          <div className="flex gap-6 mt-4 text-sm">
            <div className="text-center">
              <div className="text-mine-green font-din text-lg">{(report.totalRevenue / 10000).toFixed(1)}万</div>
              <div className="text-mine-muted text-xs">收入</div>
            </div>
            <div className="text-center">
              <div className="text-mine-red font-din text-lg">{(report.totalCost / 10000).toFixed(1)}万</div>
              <div className="text-mine-muted text-xs">成本</div>
            </div>
          </div>
        </div>
        <div className="mine-card flex flex-col items-center justify-center py-8">
          <div className="text-mine-muted text-xs mb-2">利润率</div>
          <div className="text-mine-amber font-din text-5xl font-bold">{report.profitMargin}</div>
          <div className="text-mine-muted text-sm mt-1">%</div>
          <div className="flex gap-6 mt-4 text-sm">
            <div className="text-center">
              <div className="text-mine-green font-din text-lg">↑ 2.1%</div>
              <div className="text-mine-muted text-xs">同比</div>
            </div>
            <div className="text-center">
              <div className="text-mine-cyan font-din text-lg">↑ 0.6%</div>
              <div className="text-mine-muted text-xs">环比</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="mine-card">
          <div className="text-mine-text font-medium mb-3">收入 vs 成本</div>
          <ReactECharts option={revenueCostOption} style={{ height: 260 }} />
        </div>
        <div className="mine-card">
          <div className="text-mine-text font-medium mb-3">利润率趋势</div>
          <ReactECharts option={profitTrendOption} style={{ height: 260 }} />
        </div>
      </div>

      {generated && (
        <div className="bg-mine-green/10 border border-mine-green/30 text-mine-green text-sm px-4 py-2 rounded-lg animate-slide-up">
          报表已重新生成，数据已更新
        </div>
      )}

      {pushed && (
        <div className="bg-mine-cyan/10 border border-mine-cyan/30 text-mine-cyan text-sm px-4 py-2 rounded-lg animate-slide-up">
          报表已推送至管理层，等待审批
        </div>
      )}

      {exported && (
        <div className="bg-mine-cyan/10 border border-mine-cyan/30 text-mine-cyan text-sm px-4 py-2 rounded-lg animate-slide-up">
          PDF已导出，请在
          <a
            href={`/vouchers/REPORT-${report.id}-EXPORT.pdf`}
            download
            className="text-mine-cyan underline mx-1"
          >
            此处下载
          </a>
        </div>
      )}

      {showReject && (
        <div className="bg-mine-card border border-mine-red/30 rounded-lg p-4 space-y-3 animate-slide-up">
          <div className="text-mine-red text-sm font-medium">输入驳回原因</div>
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="请输入驳回原因..."
            className="w-full bg-mine-bg border border-mine-border rounded px-3 py-2 text-sm text-mine-text placeholder:text-mine-muted focus:outline-none focus:border-mine-red/50"
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setShowReject(false); setRejectReason(''); }} className="mine-btn-outline text-sm">取消</button>
            <button onClick={handleReject} className="mine-btn-danger text-sm">确认驳回</button>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-end flex-wrap">
        <button onClick={handleGenerate} className="mine-btn-primary flex items-center gap-2" disabled={report.approvalStatus === 'pending'}>
          {generated ? <Check size={16} /> : <FileText size={16} />}
          {generated ? '已生成' : '生成报表'}
        </button>
        <button
          onClick={handlePush}
          className="mine-btn-outline flex items-center gap-2"
          disabled={report.approvalStatus === 'pending' || report.approvalStatus === 'approved'}
        >
          {pushed ? <Check size={16} /> : <Send size={16} />}
          {pushed ? '已推送' : '推送管理层'}
        </button>
        {report.approvalStatus === 'pending' && (
          <>
            <button onClick={handleApprove} className="mine-btn-primary flex items-center gap-2">
              <ThumbsUp size={16} />审批通过
            </button>
            <button onClick={() => setShowReject(true)} className="mine-btn-danger flex items-center gap-2">
              <X size={16} />审批驳回
            </button>
          </>
        )}
        <button
          onClick={handleExport}
          className="mine-btn-outline flex items-center gap-2"
          disabled={report.approvalStatus !== 'approved'}
        >
          {exported ? <Check size={16} /> : <Download size={16} />}
          {exported ? '已导出' : '导出PDF'}
        </button>
      </div>

      {auditLogs.length > 0 && (
        <div className="mine-card">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-mine-cyan" />
            <span className="text-mine-text font-medium text-sm">报表操作留痕</span>
          </div>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 text-sm">
                <span className="text-mine-cyan shrink-0">{log.operator}</span>
                <span className="text-mine-text">{log.action} - {log.detail}</span>
                <span className="text-mine-muted font-din text-xs ml-auto shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
