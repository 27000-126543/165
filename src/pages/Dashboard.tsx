import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { Users, BarChart3, Server, AlertTriangle, Shield, Factory, Cpu, Wind, Send, ClipboardCheck, Wrench, Siren, FileBarChart, ArrowRight, ChevronDown, ChevronUp, MessageSquare, History, Eye } from 'lucide-react'
import StatCard from '@/components/StatCard'
import { useAppStore } from '@/store'

const baseOption = {
  backgroundColor: 'transparent' as const,
  textStyle: { color: '#7A8BA0' },
}

const axisStyle = {
  axisLine: { lineStyle: { color: '#243352' } },
  axisTick: { lineStyle: { color: '#243352' } },
  splitLine: { lineStyle: { color: '#243352', type: 'dashed' as const } },
  axisLabel: { color: '#7A8BA0' },
}

const statusColorMap: Record<string, string> = {
  '运行中': '#00D68F',
  '空闲': '#4A7BCC',
  '预警': '#FFB800',
  '故障': '#FF3B3B',
  '维修中': '#7A8BA0',
}

const levelColor: Record<string, string> = {
  critical: 'bg-mine-red',
  emergency: 'bg-mine-red',
  warning: 'bg-mine-amber',
}

const targetIconMap: Record<string, typeof Send> = {
  task: Send,
  inspection: ClipboardCheck,
  workorder: Wrench,
  emergency: Siren,
  report: FileBarChart,
  threshold: AlertTriangle,
  message: AlertTriangle,
  drill: Siren,
}

const targetColorMap: Record<string, string> = {
  task: 'text-mine-green',
  inspection: 'text-mine-cyan',
  workorder: 'text-mine-amber',
  emergency: 'text-mine-red',
  report: 'text-mine-blue',
  threshold: 'text-mine-amber',
  message: 'text-mine-red',
  drill: 'text-mine-red',
}

const targetBgMap: Record<string, string> = {
  task: 'bg-mine-green/10',
  inspection: 'bg-mine-cyan/10',
  workorder: 'bg-mine-amber/10',
  emergency: 'bg-mine-red/10',
  report: 'bg-mine-blue/10',
  threshold: 'bg-mine-amber/10',
  message: 'bg-mine-red/10',
  drill: 'bg-mine-red/10',
}

const targetRouteMap: Record<string, (id: string) => string> = {
  task: (id) => `/production/tasks?highlight=${id}`,
  inspection: (id) => `/equipment/inspection?highlight=${id}`,
  workorder: (id) => `/equipment/workorders?highlight=${id}`,
  emergency: (id) => `/environment/emergency?highlight=${id}`,
  report: (id) => `/finance/report?highlight=${id}`,
  threshold: () => '/environment/thresholds',
  drill: (id) => `/environment/emergency?highlight=${id}`,
  message: () => '/messages',
}

const targetStatusLabel: Record<string, (id: string, store: ReturnType<typeof useAppStore.getState>) => string> = {
  task: (id, s) => {
    const t = s.productionTasks.find((x) => x.id === id)
    const cfg: Record<string, string> = { draft: '草稿', issued: '已下达', in_progress: '进行中', completed: '已完成' }
    return t ? cfg[t.status] || t.status : '—'
  },
  workorder: (id, s) => {
    const o = s.maintenanceOrders.find((x) => x.id === id)
    const cfg: Record<string, string> = { pending: '待处理', in_progress: '进行中', completed: '已完成' }
    return o ? cfg[o.status] || o.status : '—'
  },
  emergency: (id, s) => {
    const e = s.emergencyEvents.find((x) => x.id === id)
    const cfg: Record<string, string> = { active: '活跃', disposal: '处置中', resolved: '已结束' }
    return e ? cfg[e.status] || e.status : '—'
  },
  report: (id, s) => {
    const r = s.financeReports.find((x) => x.id === id)
    const cfg: Record<string, string> = { draft: '草稿', pending: '待审批', approved: '已通过', rejected: '已驳回' }
    return r ? cfg[r.approvalStatus] || r.approvalStatus : '—'
  },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const miners = useAppStore(s => s.miners)
  const alarmRecords = useAppStore(s => s.alarmRecords)
  const miningFaces = useAppStore(s => s.miningFaces)
  const equipmentList = useAppStore(s => s.equipmentList)
  const monitorPoints = useAppStore(s => s.monitorPoints)
  const auditLogs = useAppStore(s => s.auditLogs)
  const messages = useAppStore(s => s.messages)
  const readMessageIds = useAppStore(s => s.readMessageIds)
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  const isMsgRead = (id: string) => {
    const m = messages.find((x) => x.id === id)
    return m?.read || readMessageIds.includes(id)
  }

  const undergroundCount = miners.filter(m => m.isUnderground).length
  const totalOutput = miningFaces.reduce((s, f) => s + f.currentOutput, 0)
  const onlineRate = Math.round((equipmentList.filter(e => e.status === 'running').length / equipmentList.length) * 100)
  const unresolvedAlarms = alarmRecords.filter(a => !a.resolved).length

  const approvedCount = miners.filter(m => m.accessStatus === 'approved').length
  const rejectedCount = miners.filter(m => m.accessStatus === 'rejected').length
  const pendingCount = miners.filter(m => m.accessStatus === 'pending').length

  const undergroundMiners = miners.filter(m => m.isUnderground)
  const zoneCountMap: Record<string, number> = {}
  undergroundMiners.forEach(m => {
    if (m.currentPosition) {
      zoneCountMap[m.currentPosition.zone] = (zoneCountMap[m.currentPosition.zone] || 0) + 1
    }
  })

  const avgHealthScore = Math.round(equipmentList.reduce((s, e) => s + e.healthScore, 0) / equipmentList.length)
  const statusDist: Record<string, number> = {}
  equipmentList.forEach(e => {
    const label = e.status === 'running' ? '运行中' : e.status === 'idle' ? '空闲' : e.status === 'warning' ? '预警' : e.status === 'fault' ? '故障' : '维修中'
    statusDist[label] = (statusDist[label] || 0) + 1
  })

  const criticalPoint = monitorPoints.reduce((worst, mp) => {
    const order = { critical: 3, warning: 2, normal: 1 }
    return (order[mp.status] || 0) > (order[worst.status] || 0) ? mp : worst
  }, monitorPoints[0])

  const safetyPieOption = {
    ...baseOption,
    tooltip: { trigger: 'item' as const },
    legend: { bottom: 0, textStyle: { color: '#7A8BA0' } },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      label: { color: '#7A8BA0', formatter: '{b}\n{c}人' },
      data: [
        { value: approvedCount, name: '准入通过', itemStyle: { color: '#00D68F' } },
        { value: rejectedCount, name: '拒绝', itemStyle: { color: '#FF3B3B' } },
        { value: pendingCount, name: '待审', itemStyle: { color: '#FFB800' } },
      ],
    }],
  }

  const productionBarOption = {
    ...baseOption,
    tooltip: { trigger: 'axis' as const },
    legend: { top: 0, textStyle: { color: '#7A8BA0' } },
    grid: { left: 50, right: 20, bottom: 30, top: 40 },
    xAxis: { type: 'category' as const, data: miningFaces.map(f => f.name), ...axisStyle },
    yAxis: { type: 'value' as const, name: '吨', nameTextStyle: { color: '#7A8BA0' }, ...axisStyle },
    series: [
      { name: '当前产量', type: 'bar', data: miningFaces.map(f => f.currentOutput), itemStyle: { color: '#00D68F' }, barWidth: '30%' },
      { name: '目标产量', type: 'bar', data: miningFaces.map(f => f.dailyTarget), itemStyle: { color: '#243352' }, barWidth: '30%' },
    ],
  }

  const equipmentGaugeOption = {
    ...baseOption,
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      radius: '85%',
      center: ['50%', '55%'],
      progress: { show: true, width: 14, itemStyle: { color: avgHealthScore >= 70 ? '#00D68F' : avgHealthScore >= 50 ? '#FFB800' : '#FF3B3B' } },
      axisLine: { lineStyle: { width: 14, color: [[1, '#243352']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      title: { show: true, offsetCenter: [0, '30%'], color: '#7A8BA0', fontSize: 12 },
      detail: { valueAnimation: true, offsetCenter: [0, '0%'], fontSize: 28, fontWeight: 'bold', color: '#E0E8F0', formatter: '{value}' },
      data: [{ value: avgHealthScore, name: '平均健康评分' }],
    }],
  }

  const equipStatusPieOption = {
    ...baseOption,
    tooltip: { trigger: 'item' as const },
    legend: { bottom: 0, textStyle: { color: '#7A8BA0', fontSize: 10 } },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '42%'],
      label: { color: '#7A8BA0', fontSize: 10, formatter: '{b}\n{c}台' },
      data: Object.entries(statusDist).map(([name, value]) => ({
        value,
        name,
        itemStyle: { color: statusColorMap[name] || '#7A8BA0' },
      })),
    }],
  }

  const envLineOption = {
    ...baseOption,
    tooltip: { trigger: 'axis' as const },
    legend: { top: 0, textStyle: { color: '#7A8BA0' } },
    grid: { left: 50, right: 20, bottom: 30, top: 40 },
    xAxis: { type: 'category' as const, data: criticalPoint.history.map(h => h.timestamp), ...axisStyle },
    yAxis: [
      { type: 'value' as const, name: '瓦斯(%)', nameTextStyle: { color: '#7A8BA0' }, ...axisStyle },
      { type: 'value' as const, name: '粉尘(mg/m³)', nameTextStyle: { color: '#7A8BA0' }, ...axisStyle },
    ],
    series: [
      {
        name: '瓦斯浓度',
        type: 'line',
        data: criticalPoint.history.map(h => h.gas),
        smooth: true,
        lineStyle: { color: '#FF3B3B' },
        itemStyle: { color: '#FF3B3B' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,59,59,0.3)' }, { offset: 1, color: 'rgba(255,59,59,0)' }] } },
        markLine: { silent: true, data: [{ yAxis: criticalPoint.gasThreshold, lineStyle: { color: '#FF3B3B', type: 'dashed' }, label: { formatter: '阈值', color: '#FF3B3B' } }] },
      },
      {
        name: '粉尘浓度',
        type: 'line',
        yAxisIndex: 1,
        data: criticalPoint.history.map(h => h.dust),
        smooth: true,
        lineStyle: { color: '#FFB800' },
        itemStyle: { color: '#FFB800' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,184,0,0.3)' }, { offset: 1, color: 'rgba(255,184,0,0)' }] } },
        markLine: { silent: true, data: [{ yAxis: criticalPoint.dustThreshold, lineStyle: { color: '#FFB800', type: 'dashed' }, label: { formatter: '阈值', color: '#FFB800' } }] },
      },
    ],
  }

  const getRelatedMessages = (log: typeof auditLogs[0]) => {
    return messages.filter((m) => {
      if (m.relatedId === log.targetId) return true
      if (log.relatedObjectType && log.relatedObjectId && m.relatedId === log.relatedObjectId) return true
      return false
    }).slice(0, 5)
  }

  const getRelatedLogs = (log: typeof auditLogs[0]) => {
    const sameTarget = auditLogs.filter((l) => l.targetId === log.targetId && l.id !== log.id).slice(0, 5)
    if (log.relatedObjectType && log.relatedObjectId) {
      const linked = auditLogs.filter((l) => l.targetId === log.relatedObjectId && l.id !== log.id).slice(0, 3)
      return [...sameTarget, ...linked].slice(0, 5)
    }
    return sameTarget
  }

  const getBusinessStatus = (log: typeof auditLogs[0]) => {
    const store = useAppStore.getState()
    const fn = targetStatusLabel[log.targetType]
    if (fn) return fn(log.targetId, store)
    if (log.relatedObjectType) {
      const fn2 = targetStatusLabel[log.relatedObjectType]
      if (fn2) return fn2(log.relatedObjectId, store)
    }
    return null
  }

  const handleTimelineClick = (log: typeof auditLogs[0]) => {
    setExpandedLogId(expandedLogId === log.id ? null : log.id)
  }

  const handleNavigate = (log: typeof auditLogs[0]) => {
    const routeFn = targetRouteMap[log.targetType]
    if (routeFn) {
      navigate(routeFn(log.targetId))
    } else if (log.route) {
      navigate(log.route)
    }
  }

  const handleMsgNavigate = (msg: typeof messages[0]) => {
    if (msg.relatedRoute) {
      const route = msg.relatedId ? `${msg.relatedRoute}?highlight=${msg.relatedId}` : msg.relatedRoute
      navigate(route)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} value={undergroundCount} label="井下人数" color="cyan" />
        <StatCard icon={BarChart3} value={`${totalOutput}吨`} label="今日产量" color="green" trend="+8.2%" />
        <StatCard icon={Server} value={`${onlineRate}%`} label="设备在线率" color="blue" />
        <StatCard icon={AlertTriangle} value={unresolvedAlarms} label="告警事件" color="red" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="mine-card">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-mine-cyan" />
            <span className="text-mine-text font-medium text-sm">安全概览</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ReactECharts option={safetyPieOption} style={{ height: 200 }} />
            <div className="space-y-2">
              <div className="text-mine-muted text-xs mb-2">各区域井下人数</div>
              {Object.entries(zoneCountMap).map(([zone, count]) => (
                <div key={zone} className="flex items-center justify-between text-sm">
                  <span className="text-mine-text">{zone}</span>
                  <span className="text-mine-cyan font-din">{count}人</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mine-card">
          <div className="flex items-center gap-2 mb-3">
            <Factory className="w-4 h-4 text-mine-green" />
            <span className="text-mine-text font-medium text-sm">生产概览</span>
          </div>
          <ReactECharts option={productionBarOption} style={{ height: 240 }} />
        </div>

        <div className="mine-card">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-mine-blue" />
            <span className="text-mine-text font-medium text-sm">设备概览</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ReactECharts option={equipmentGaugeOption} style={{ height: 180 }} />
            <ReactECharts option={equipStatusPieOption} style={{ height: 180 }} />
          </div>
        </div>

        <div className="mine-card">
          <div className="flex items-center gap-2 mb-3">
            <Wind className="w-4 h-4 text-mine-amber" />
            <span className="text-mine-text font-medium text-sm">环境概览</span>
            <span className="text-mine-red text-xs ml-auto">
              {criticalPoint.name} ({criticalPoint.status === 'critical' ? '超标' : criticalPoint.status === 'warning' ? '预警' : '正常'})
            </span>
          </div>
          <ReactECharts option={envLineOption} style={{ height: 240 }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="mine-card">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-mine-red" />
            <span className="text-mine-text font-medium text-sm">告警时间线</span>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-0">
            {alarmRecords.map(record => (
              <div key={record.id} className="flex gap-3 relative pb-4">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${levelColor[record.level] || 'bg-mine-amber'} shrink-0 mt-1.5`} />
                  <div className="w-px flex-1 bg-mine-border" />
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-mine-text text-sm">{record.minerName}</span>
                    <span className="text-mine-muted text-xs">{record.zone}</span>
                    {record.resolved && <span className="text-mine-green text-xs">已解决</span>}
                  </div>
                  <p className="text-mine-muted text-xs mb-0.5">{record.message}</p>
                  <span className="text-mine-muted text-[10px]">{record.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mine-card">
          <div className="flex items-center gap-2 mb-3">
            <Send className="w-4 h-4 text-mine-cyan" />
            <span className="text-mine-text font-medium text-sm">调度态势时间轴</span>
            <span className="text-mine-muted text-xs ml-auto">点击展开关联链路</span>
          </div>
          <div className="max-h-[500px] overflow-y-auto space-y-0">
            {auditLogs.length === 0 ? (
              <div className="text-mine-muted text-sm text-center py-8">暂无调度操作记录，执行业务操作后将在此展示</div>
            ) : (
              auditLogs.slice(0, 20).map(log => {
                const Icon = targetIconMap[log.targetType] || AlertTriangle
                const color = targetColorMap[log.targetType] || 'text-mine-muted'
                const bg = targetBgMap[log.targetType] || 'bg-mine-border'
                const isExpanded = expandedLogId === log.id
                const relatedMsgs = isExpanded ? getRelatedMessages(log) : []
                const relatedLogs = isExpanded ? getRelatedLogs(log) : []
                const bizStatus = isExpanded ? getBusinessStatus(log) : null
                return (
                  <div key={log.id}>
                    <div
                      className="flex gap-3 relative pb-2 cursor-pointer group"
                      onClick={() => handleTimelineClick(log)}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                          <Icon size={14} className={color} />
                        </div>
                        <div className="w-px flex-1 bg-mine-border" />
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-mine-text text-sm font-medium">{log.action}</span>
                          <span className="text-mine-muted text-[10px]">{log.targetType}#{log.targetId}</span>
                          {isExpanded ? (
                            <ChevronUp size={12} className="text-mine-cyan" />
                          ) : (
                            <ChevronDown size={12} className="text-mine-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                        <p className="text-mine-muted text-xs mb-0.5">{log.detail}</p>
                        <div className="flex items-center gap-3 text-[10px] text-mine-muted">
                          <span>{log.operator}</span>
                          <span className="font-din">{log.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="ml-10 mb-3 border border-mine-border rounded-lg p-3 space-y-3 bg-mine-bg/50 animate-slide-up">
                        {bizStatus && (
                          <div className="flex items-center gap-2 text-xs">
                            <Eye size={12} className="text-mine-cyan" />
                            <span className="text-mine-muted">当前状态：</span>
                            <span className="text-mine-text font-medium">{bizStatus}</span>
                          </div>
                        )}

                        {relatedMsgs.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 text-xs text-mine-muted mb-1.5">
                              <MessageSquare size={11} className="text-mine-blue" />关联消息
                            </div>
                            <div className="space-y-1">
                              {relatedMsgs.map((m) => (
                                <div
                                  key={m.id}
                                  className="flex items-center gap-2 text-xs bg-mine-card rounded px-2 py-1.5 cursor-pointer hover:bg-mine-border/30"
                                  onClick={() => handleMsgNavigate(m)}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isMsgRead(m.id) ? 'bg-mine-border' : 'bg-mine-cyan'}`} />
                                  <span className={`${isMsgRead(m.id) ? 'text-mine-muted' : 'text-mine-text'} truncate flex-1`}>{m.title}</span>
                                  <span className="text-mine-muted shrink-0">{m.timestamp.slice(5, 16)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {relatedLogs.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 text-xs text-mine-muted mb-1.5">
                              <History size={11} className="text-mine-amber" />关联操作
                            </div>
                            <div className="space-y-1">
                              {relatedLogs.map((l) => (
                                <div key={l.id} className="flex items-center gap-2 text-xs text-mine-muted">
                                  <span className="text-mine-cyan">{l.operator}</span>
                                  <span>{l.action}</span>
                                  <span className="font-din ml-auto shrink-0">{l.timestamp.slice(11, 16)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleNavigate(log)}
                          className="mine-btn-outline text-xs py-1 flex items-center gap-1"
                        >
                          <ArrowRight size={11} />跳转到业务详情
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
