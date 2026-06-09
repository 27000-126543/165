import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { useAppStore } from '@/store'

type FilterKey = 'all' | 'approved' | 'rejected' | 'pending'

const filterTabs: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已拒绝' },
  { key: 'pending', label: '待审核' },
]

export default function AccessList() {
  const miners = useAppStore(s => s.miners)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')

  const filtered = miners.filter(m => {
    if (filter !== 'all' && m.accessStatus !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return m.name.toLowerCase().includes(q) || m.employeeId.toLowerCase().includes(q) || m.team.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mine-muted" />
          <input
            type="text"
            placeholder="搜索工号、姓名、班组..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-mine-card border border-mine-border rounded-lg pl-9 pr-4 py-2 text-sm text-mine-text placeholder:text-mine-muted focus:outline-none focus:border-mine-cyan"
          />
        </div>
        <div className="flex gap-1 bg-mine-card border border-mine-border rounded-lg p-1">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${filter === tab.key ? 'bg-mine-cyan/20 text-mine-cyan' : 'text-mine-muted hover:text-mine-text'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mine-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mine-border">
                <th className="text-left py-3 px-4 text-mine-muted font-medium text-xs">工号</th>
                <th className="text-left py-3 px-4 text-mine-muted font-medium text-xs">姓名</th>
                <th className="text-left py-3 px-4 text-mine-muted font-medium text-xs">班组</th>
                <th className="text-left py-3 px-4 text-mine-muted font-medium text-xs">健康状态</th>
                <th className="text-left py-3 px-4 text-mine-muted font-medium text-xs">培训记录</th>
                <th className="text-left py-3 px-4 text-mine-muted font-medium text-xs">准入状态</th>
                <th className="text-left py-3 px-4 text-mine-muted font-medium text-xs">是否下井</th>
                <th className="text-left py-3 px-4 text-mine-muted font-medium text-xs">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(miner => {
                const passed = miner.trainingRecords.filter(t => t.passed).length
                const failed = miner.trainingRecords.filter(t => !t.passed).length
                return (
                  <tr key={miner.id} className="border-b border-mine-border/50 hover:bg-mine-border/20 transition-colors">
                    <td className="py-3 px-4 text-mine-text font-din">{miner.employeeId}</td>
                    <td className="py-3 px-4 text-mine-text">{miner.name}</td>
                    <td className="py-3 px-4 text-mine-muted">{miner.team}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${miner.healthStatus === 'normal' ? 'bg-mine-green' : 'bg-mine-red'}`} />
                        <span className={miner.healthStatus === 'normal' ? 'text-mine-green' : 'text-mine-red'}>
                          {miner.healthStatus === 'normal' ? '正常' : '异常'}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-mine-green">{passed}通过</span>
                      {failed > 0 && <span className="text-mine-red ml-1">{failed}未通过</span>}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={miner.accessStatus} />
                    </td>
                    <td className="py-3 px-4">
                      {miner.isUnderground ? (
                        <span className="text-mine-cyan">下井中</span>
                      ) : (
                        <span className="text-mine-muted">未下井</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/safety/access/${miner.id}`} className="text-mine-cyan hover:underline text-xs">
                        查看详情
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-mine-muted text-sm">暂无数据</div>
        )}
      </div>
    </div>
  )
}
