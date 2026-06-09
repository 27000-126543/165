import { useLocation, Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAppStore } from '@/store';
import { useEffect, useState } from 'react';

const pathNameMap: Record<string, string> = {
  '': '综合驾驶舱',
  safety: '安全管理',
  access: '安全准入',
  positioning: '人员定位',
  alarms: '报警记录',
  production: '生产调度',
  monitor: '采掘面监控',
  vehicles: '车辆调度',
  tasks: '任务单',
  equipment: '设备管理',
  list: '设备台账',
  inspection: '巡检管理',
  prediction: '故障预测',
  workorders: '维修工单',
  environment: '环境应急',
  thresholds: '阈值管理',
  emergency: '应急管理',
  quality: '质量检测',
  samples: '样本管理',
  grade: '品位判定',
  params: '选矿参数',
  finance: '财务分析',
  cost: '成本分析',
  report: '利润报表',
  messages: '消息中心',
};

export default function Header() {
  const location = useLocation();
  const { unreadMessages, currentUser } = useAppStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const segments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: pathNameMap[seg] || seg,
    path: '/' + segments.slice(0, i + 1).join('/'),
  }));

  if (location.pathname === '/') {
    breadcrumbs.unshift({ label: '综合驾驶舱', path: '/' });
  }

  const formattedTime = time.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <header className="h-14 bg-mine-card border-b border-mine-border flex items-center justify-between px-6 shrink-0">
      <nav className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-2">
            {i > 0 && <span className="text-mine-muted">/</span>}
            <span
              className={
                i === breadcrumbs.length - 1
                  ? 'text-mine-text'
                  : 'text-mine-muted'
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-5">
        <Link
          to="/messages"
          className="relative text-mine-muted hover:text-mine-text transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-mine-red rounded-full" />
          )}
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-mine-cyan/20 text-mine-cyan flex items-center justify-center text-xs font-bold">
            {currentUser.avatar}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm text-mine-text leading-tight">
              {currentUser.name}
            </div>
            <div className="text-xs text-mine-muted leading-tight">
              {currentUser.role}
            </div>
          </div>
        </div>

        <div className="text-xs text-mine-muted font-din tracking-wider hidden md:block">
          {formattedTime}
        </div>
      </div>
    </header>
  );
}
