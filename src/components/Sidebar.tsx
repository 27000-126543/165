import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  MapPin,
  Bell,
  BarChart3,
  Truck,
  ClipboardList,
  Server,
  Wrench,
  Activity,
  FileText,
  Thermometer,
  Settings,
  AlertTriangle,
  FlaskConical,
  Gem,
  Settings2,
  TrendingUp,
  PieChart,
  FileBarChart,
  MessageSquare,
  HardHat,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useAppStore } from '@/store';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: '安全管理',
    items: [
      { path: '/safety/access', label: '安全准入', icon: ShieldCheck },
      { path: '/safety/positioning', label: '人员定位', icon: MapPin },
      { path: '/safety/alarms', label: '报警记录', icon: Bell },
    ],
  },
  {
    label: '生产调度',
    items: [
      { path: '/production/monitor', label: '采掘面监控', icon: BarChart3 },
      { path: '/production/vehicles', label: '车辆调度', icon: Truck },
      { path: '/production/tasks', label: '任务单', icon: ClipboardList },
    ],
  },
  {
    label: '设备管理',
    items: [
      { path: '/equipment/list', label: '设备台账', icon: Server },
      { path: '/equipment/inspection', label: '巡检管理', icon: Wrench },
      { path: '/equipment/prediction', label: '故障预测', icon: Activity },
      { path: '/equipment/workorders', label: '维修工单', icon: FileText },
    ],
  },
  {
    label: '环境应急',
    items: [
      { path: '/environment/monitor', label: '环境监测', icon: Thermometer },
      { path: '/environment/thresholds', label: '阈值管理', icon: Settings },
      { path: '/environment/emergency', label: '应急管理', icon: AlertTriangle },
    ],
  },
  {
    label: '质量检测',
    items: [
      { path: '/quality/samples', label: '样本管理', icon: FlaskConical },
      { path: '/quality/grade', label: '品位判定', icon: Gem },
      { path: '/quality/params', label: '选矿参数', icon: Settings2 },
    ],
  },
  {
    label: '财务分析',
    items: [
      { path: '/finance/production', label: '产量统计', icon: TrendingUp },
      { path: '/finance/cost', label: '成本分析', icon: PieChart },
      { path: '/finance/report', label: '利润报表', icon: FileBarChart },
    ],
  },
  {
    label: '系统',
    items: [
      { path: '/messages', label: '消息中心', icon: MessageSquare },
    ],
  },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={`${
        sidebarCollapsed ? 'w-16' : 'w-60'
      } h-screen bg-mine-bg border-r border-mine-border flex flex-col transition-all duration-300 shrink-0`}
    >
      <div className="h-14 flex items-center gap-3 px-4 border-b border-mine-border shrink-0">
        <HardHat className="w-7 h-7 text-mine-cyan shrink-0" />
        {!sidebarCollapsed && (
          <span className="text-lg font-bold text-mine-text whitespace-nowrap">
            智慧矿山
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 mx-2 my-0.5 px-3 py-2 rounded-md transition-colors relative ${
              isActive
                ? 'bg-mine-cyan/10 text-mine-cyan border-l-2 border-mine-cyan'
                : 'text-mine-muted hover:bg-mine-cyan/5 hover:text-mine-text border-l-2 border-transparent'
            } ${sidebarCollapsed ? 'justify-center' : ''}`
          }
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          {!sidebarCollapsed && <span className="text-sm">综合驾驶舱</span>}
        </NavLink>

        {menuGroups.map((group) => (
          <div key={group.label} className="mt-3">
            {!sidebarCollapsed && (
              <div className="px-5 py-1 text-xs font-medium text-mine-muted/60 uppercase tracking-wider">
                {group.label}
              </div>
            )}
            {sidebarCollapsed && (
              <div className="mx-2 my-1 border-t border-mine-border/50" />
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 mx-2 my-0.5 px-3 py-2 rounded-md transition-colors relative ${
                    isActive
                      ? 'bg-mine-cyan/10 text-mine-cyan border-l-2 border-mine-cyan'
                      : 'text-mine-muted hover:bg-mine-cyan/5 hover:text-mine-text border-l-2 border-transparent'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && (
                  <span className="text-sm">{item.label}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-mine-border p-2 shrink-0">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-mine-muted hover:text-mine-text hover:bg-mine-cyan/5 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronsLeft className="w-5 h-5" />
              <span className="text-sm">收起侧栏</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
