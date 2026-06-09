import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { useAppStore } from '@/store';

export default function Thresholds() {
  const monitorPoints = useAppStore((s) => s.monitorPoints);
  const saveThresholds = useAppStore((s) => s.saveThresholds);

  const [thresholds, setThresholds] = useState(() =>
    monitorPoints.map((p) => ({
      id: p.id,
      name: p.name,
      location: p.location,
      gasConcentration: p.gasConcentration,
      dustConcentration: p.dustConcentration,
      gasThreshold: p.gasThreshold,
      dustThreshold: p.dustThreshold,
    }))
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveThresholds(
      thresholds.map((t) => ({
        id: t.id,
        gasThreshold: t.gasThreshold,
        dustThreshold: t.dustThreshold,
      }))
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getBarColor = (percent: number) => {
    if (percent > 80) return 'bg-mine-red';
    if (percent > 60) return 'bg-mine-amber';
    return 'bg-mine-green';
  };

  const getTextColor = (percent: number) => {
    if (percent > 80) return 'text-mine-red';
    if (percent > 60) return 'text-mine-amber';
    return 'text-mine-green';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-mine-text text-lg font-medium">阈值管理</h2>
        <button onClick={handleSave} className="mine-btn-primary flex items-center gap-2">
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? '已保存' : '保存设置'}
        </button>
      </div>

      {saved && (
        <div className="bg-mine-green/10 border border-mine-green/30 text-mine-green text-sm px-4 py-2 rounded-lg animate-slide-up">
          阈值设置已保存成功
        </div>
      )}

      <div className="mine-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mine-border">
              <th className="text-left text-mine-muted py-3 px-4 font-medium">监测点</th>
              <th className="text-left text-mine-muted py-3 px-4 font-medium">位置</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">当前瓦斯</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">瓦斯阈值</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">瓦斯进度</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">当前粉尘</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">粉尘阈值</th>
              <th className="text-center text-mine-muted py-3 px-4 font-medium">粉尘进度</th>
            </tr>
          </thead>
          <tbody>
            {thresholds.map((item) => {
              const gasPercent = Math.round((item.gasConcentration / item.gasThreshold) * 100);
              const dustPercent = Math.round((item.dustConcentration / item.dustThreshold) * 100);
              return (
                <tr key={item.id} className="border-b border-mine-border/50 hover:bg-mine-bg/50">
                  <td className="text-mine-text py-3 px-4 font-medium">{item.name}</td>
                  <td className="text-mine-muted py-3 px-4">{item.location}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`font-din ${getTextColor(gasPercent)}`}>{item.gasConcentration}%</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={item.gasThreshold}
                      onChange={(e) =>
                        setThresholds((prev) =>
                          prev.map((t) =>
                            t.id === item.id ? { ...t, gasThreshold: parseFloat(e.target.value) || 0.1 } : t
                          )
                        )
                      }
                      className="w-20 bg-mine-bg border border-mine-border rounded px-2 py-1 text-center text-mine-text font-din text-sm focus:outline-none focus:border-mine-cyan"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-mine-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getBarColor(gasPercent)}`}
                          style={{ width: `${Math.min(gasPercent, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-din ${getTextColor(gasPercent)}`}>{gasPercent}%</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`font-din ${getTextColor(dustPercent)}`}>{item.dustConcentration}</span>
                    <span className="text-mine-muted text-xs ml-1">mg/m³</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={item.dustThreshold}
                      onChange={(e) =>
                        setThresholds((prev) =>
                          prev.map((t) =>
                            t.id === item.id ? { ...t, dustThreshold: parseFloat(e.target.value) || 1 } : t
                          )
                        )
                      }
                      className="w-20 bg-mine-bg border border-mine-border rounded px-2 py-1 text-center text-mine-text font-din text-sm focus:outline-none focus:border-mine-cyan"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-mine-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getBarColor(dustPercent)}`}
                          style={{ width: `${Math.min(dustPercent, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-din ${getTextColor(dustPercent)}`}>{dustPercent}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
