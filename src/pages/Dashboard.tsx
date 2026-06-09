import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { Users, BarChart3, Server, AlertTriangle, Shield, Factory, Cpu, Wind, Send, ClipboardCheck, Wrench, Siren, FileBarChart, ArrowRight } from 'lucide-react'
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
}

const targetColorMap: Record<string, string> = {
  task: 'text-mine-green',
  inspection: 'text-mine-cyan',
  workorder: 'text-mine-amber',
  emergency: 'text-mine-red',
  report: 'text-mine-blue',
  threshold: 'text-mine-amber',
  message: 'text-mine-red',
}

const targetBgMap: Record<string, string> = {
  task: 'bg-mine-green/10',
  inspection: 'bg-mine-cyan/10',
  workorder: 'bg-mine-amber/10',
  emergency: 'bg-mine-red/10',
  report: 'bg-mine-blue/10',
  threshold: 'bg-mine-amber/10',
  message: 'bg-mine-red/10',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const miners = useAppStore(s => s.miners)
  const alarmRecords = useAppStore(s => s.alarmRecords)
  const miningFaces = useAppStore(s => s.miningFaces)
  const equipmentList = useAppStore(s => s.equipmentList)
  const monitorPoints = useAppStore(s => s.monitorPoints)
  const auditLogs = useAppStore(s => s.auditLogs)

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

  const handleTimelineClick = (log: typeof auditLogs[0]) => {
    if (log.route) {
      navigate(log.route)
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
          </div>
          <div className="max-h-64 overflow-y-auto space-y-0">
            {auditLogs.length === 0 ? (
              <div className="text-mine-muted text-sm text-center py-8">暂无调度操作记录，执行业务操作后将在此展示</div>
            ) : (
              auditLogs.slice(0, 20).map(log => {
                const Icon = targetIconMap[log.targetType] || AlertTriangle
                const color = targetColorMap[log.targetType] || 'text-mine-muted'
                const bg = targetBgMap[log.targetType] || 'bg-mine-border'
                return (
                  <div
                    key={log.id}
                    className="flex gap-3 relative pb-4 cursor-pointer group"
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
                        {log.route && (
                          <ArrowRight size={10} className="text-mine-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <p className="text-mine-muted text-xs mb-0.5">{log.detail}</p>
                      <div className="flex items-center gap-3 text-[10px] text-mine-muted">
                        <span>{log.operator}</span>
                        <span className="font-din">{log.timestamp}</span>
                      </div>
                    </div>
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
