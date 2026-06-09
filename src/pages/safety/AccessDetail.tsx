import { useParams, useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { ArrowLeft, User, Heart, BookOpen, CheckCircle, XCircle } from 'lucide-react'
import { miners } from '@/data/miners'

const statusDisplay = {
  approved: { label: '通过', color: 'text-mine-green', bg: 'bg-mine-green/20', border: 'border-mine-green/30' },
  rejected: { label: '拒绝', color: 'text-mine-red', bg: 'bg-mine-red/20', border: 'border-mine-red/30' },
  pending: { label: '待审核', color: 'text-mine-amber', bg: 'bg-mine-amber/20', border: 'border-mine-amber/30' },
}

const rejectReasons: Record<string, string> = {
  M003: '血压偏高(145/95)，心率过快(92bpm)，血氧偏低(94%)，暂不满足下井健康要求',
  M005: '瓦斯防爆安全培训未通过，需重新培训并考核通过后方可准入',
  M012: '通风安全培训已过期，需重新参加培训并取得合格证书',
}

export default function AccessDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const miner = miners.find(m => m.id === id)

  if (!miner) {
    return (
      <div className="flex items-center justify-center h-full text-mine-muted">
        未找到该矿工信息
      </div>
    )
  }

  const { healthData, trainingRecords, accessStatus } = miner
  const config = statusDisplay[accessStatus]

  const systolic = parseInt(healthData.bloodPressure.split('/')[0])
  const diastolic = parseInt(healthData.bloodPressure.split('/')[1])
  const maxVital = 160

  const radarOption = {
    backgroundColor: 'transparent' as const,
    textStyle: { color: '#7A8BA0' },
    radar: {
      indicator: [
        { name: '收缩压', max: maxVital },
        { name: '舒张压', max: maxVital },
        { name: '心率', max: 120 },
        { name: '血氧', max: 100 },
      ],
      shape: 'polygon' as const,
      splitNumber: 4,
      axisName: { color: '#7A8BA0', fontSize: 11 },
      splitLine: { lineStyle: { color: '#243352' } },
      splitArea: { areaStyle: { color: ['transparent', 'rgba(36,51,82,0.3)'] } },
      axisLine: { lineStyle: { color: '#243352' } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: [systolic, diastolic, healthData.heartRate, healthData.bloodOxygen],
        name: '健康指标',
        lineStyle: { color: '#00F0FF' },
        areaStyle: { color: 'rgba(0,240,255,0.15)' },
        itemStyle: { color: '#00F0FF' },
      }],
    }],
  }

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-mine-muted hover:text-mine-cyan text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </button>

      <div className="mine-card">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-mine-cyan" />
          <span className="text-mine-text font-medium">矿工信息</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-mine-muted text-xs mb-1">姓名</div>
            <div className="text-mine-text">{miner.name}</div>
          </div>
          <div>
            <div className="text-mine-muted text-xs mb-1">工号</div>
            <div className="text-mine-text font-din">{miner.employeeId}</div>
          </div>
          <div>
            <div className="text-mine-muted text-xs mb-1">班组</div>
            <div className="text-mine-text">{miner.team}</div>
          </div>
          <div>
            <div className="text-mine-muted text-xs mb-1">最近体检</div>
            <div className="text-mine-text font-din">{healthData.lastCheckup}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="mine-card">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-mine-red" />
            <span className="text-mine-text font-medium text-sm">健康数据</span>
          </div>
          <ReactECharts option={radarOption} style={{ height: 260 }} />
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[
              { label: '血压', value: healthData.bloodPressure, unit: 'mmHg' },
              { label: '心率', value: healthData.heartRate, unit: 'bpm' },
              { label: '血氧', value: healthData.bloodOxygen, unit: '%' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="text-mine-muted text-xs">{item.label}</div>
                <div className="text-mine-text font-din text-lg">{item.value}<span className="text-mine-muted text-xs ml-0.5">{item.unit}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mine-card">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-mine-amber" />
            <span className="text-mine-text font-medium text-sm">培训记录</span>
          </div>
          <div className="space-y-3">
            {trainingRecords.map((record, idx) => (
              <div key={record.id} className="flex gap-3 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${record.passed ? 'bg-mine-green' : 'bg-mine-red'}`} />
                  {idx < trainingRecords.length - 1 && <div className="w-px flex-1 bg-mine-border" />}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-mine-text text-sm">{record.course}</span>
                    {record.passed ? (
                      <CheckCircle className="w-3.5 h-3.5 text-mine-green" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-mine-red" />
                    )}
                  </div>
                  <div className="text-mine-muted text-xs mt-0.5">
                    完成时间: {record.completedAt} | 有效期至: {record.validUntil}
                  </div>
                </div>
              </div>
            ))}
            {trainingRecords.length === 0 && (
              <div className="text-mine-muted text-sm text-center py-4">暂无培训记录</div>
            )}
          </div>
        </div>
      </div>

      <div className="mine-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-mine-text font-medium">准入判定</span>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${config.bg} ${config.border}`}>
              <span className={`text-xl font-bold ${config.color}`}>{config.label}</span>
            </div>
          </div>
          {accessStatus === 'rejected' && rejectReasons[miner.id] && (
            <div className="text-mine-muted text-sm max-w-md">
              原因: {rejectReasons[miner.id]}
            </div>
          )}
          {accessStatus === 'pending' && (
            <div className="text-mine-muted text-sm">等待安全管理人员审核</div>
          )}
        </div>
        {(accessStatus === 'pending' || accessStatus === 'rejected') && (
          <div className="flex gap-3 mt-4 justify-end">
            {accessStatus === 'pending' && (
              <>
                <button className="mine-btn-primary text-sm">批准入井</button>
                <button className="mine-btn-danger text-sm">拒绝入井</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
