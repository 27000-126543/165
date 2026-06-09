import { create } from 'zustand';
import type {
  Miner, AlarmRecord, DangerZone,
  MiningFace, Vehicle, ProductionTask,
  Equipment, InspectionRecord, MaintenanceOrder,
  MonitorPoint, EmergencyEvent, DisposalStep, DrillPlan,
  OreSample, ProcessAdjustment,
  FinanceReport, Message, AuditLog,
} from '@/types';
import { miners as initMiners, alarmRecords as initAlarms, dangerZones as initDangerZones } from '@/data/miners';
import { miningFaces as initMiningFaces, vehicles as initVehicles, productionTasks as initTasks } from '@/data/production';
import { equipmentList as initEquipment, inspectionRecords as initInspections, maintenanceOrders as initOrders } from '@/data/equipment';
import { monitorPoints as initMonitorPoints, emergencyEvents as initEmergencies } from '@/data/environment';
import { oreSamples as initSamples, processAdjustments as initAdjustments } from '@/data/quality';
import { financeReports as initReports, messages as initMessages } from '@/data/finance';

const STORE_KEY = 'mine-read-ids';

const loadReadIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveReadIds = (ids: string[]) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(ids)); } catch {}
};

const now = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
};

let msgSeq = 100;
const nextMsgId = () => `MSG${String(++msgSeq).padStart(3,'0')}`;
let irSeq = 100;
const nextIrId = () => `IR${String(++irSeq).padStart(3,'0')}`;
let moSeq = 100;
const nextMoId = () => `MO${String(++moSeq).padStart(3,'0')}`;
let emSeq = 100;
const nextEmId = () => `EM${String(++emSeq).padStart(3,'0')}`;
let alSeq = 100;
const nextAlId = () => `AL${String(++alSeq).padStart(3,'0')}`;

const typeLabels: Record<string, string> = {
  gas_over: '瓦斯超标',
  dust_over: '粉尘超标',
  collapse: '坍塌',
  flood: '水害',
};

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  currentUser: { name: string; role: string; avatar: string };

  miners: Miner[];
  alarmRecords: AlarmRecord[];
  dangerZones: DangerZone[];

  miningFaces: MiningFace[];
  vehicles: Vehicle[];
  productionTasks: ProductionTask[];
  updateTaskStatus: (id: string, status: ProductionTask['status']) => void;
  updateTaskTarget: (id: string, target: number) => void;
  updateTaskAssigned: (id: string, assigned: string[]) => void;

  equipmentList: Equipment[];
  inspectionRecords: InspectionRecord[];
  maintenanceOrders: MaintenanceOrder[];
  submitInspection: (eqId: string, vibration: number, temperature: number, notes: string) => void;
  updateWorkOrderStatus: (id: string, status: MaintenanceOrder['status']) => void;

  monitorPoints: MonitorPoint[];
  emergencyEvents: EmergencyEvent[];
  drillPlans: DrillPlan[];
  saveThresholds: (updated: { id: string; gasThreshold: number; dustThreshold: number }[]) => void;
  triggerBroadcast: (eventId: string) => void;
  updateEmergencyDisposal: (eventId: string, data: { evacuationCount?: number; notifiedTeams?: string[] }) => void;
  toggleDisposalStep: (eventId: string, stepIndex: number) => void;
  closeEmergency: (eventId: string) => void;
  createDrillPlan: (eventId: string) => void;

  oreSamples: OreSample[];
  processAdjustments: ProcessAdjustment[];

  financeReports: FinanceReport[];
  generateReport: () => void;
  pushReportToManagement: () => void;
  approveReport: () => void;
  rejectReport: (reason: string) => void;
  exportPdf: () => void;

  messages: Message[];
  readMessageIds: string[];
  unreadCount: number;
  markMessageRead: (id: string) => void;
  markAllRead: () => void;
  confirmMessage: (id: string) => void;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;

  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp' | 'operator'>) => void;
}

const recalcUnread = (msgs: Message[], readIds: string[]): number => {
  return msgs.filter((m) => !m.read && !readIds.includes(m.id)).length;
};

export const useAppStore = create<AppState>((set, get) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  currentUser: { name: '李明', role: '值班调度员', avatar: 'LM' },

  miners: initMiners,
  alarmRecords: initAlarms,
  dangerZones: initDangerZones,

  miningFaces: initMiningFaces,
  vehicles: initVehicles,
  productionTasks: initTasks,
  updateTaskStatus: (id, status) => {
    const task = get().productionTasks.find((t) => t.id === id);
    if (!task) return;
    const actionMap: Record<string, string> = { draft: '创建', issued: '下达', in_progress: '开始', completed: '完成' };
    set((s) => ({
      productionTasks: s.productionTasks.map((t) => t.id === id ? { ...t, status } : t),
    }));
    get().addAuditLog({
      action: `${actionMap[status] || status}任务`,
      targetType: 'task',
      targetId: id,
      detail: `${task.miningFaceName}任务单状态变更为${actionMap[status] || status}`,
      route: '/production/tasks',
    });
    if (status === 'issued') {
      get().addMessage({
        type: 'dispatch',
        title: '生产任务已下达',
        content: `${task.miningFaceName}任务单已下达，目标${task.target}吨，负责人：${task.assigned.join('、')}`,
        sender: '生产调度系统',
        recipients: task.assigned,
        level: 'info',
        hasVoucher: true,
        voucherUrl: `/vouchers/DISPATCH-${id}.pdf`,
        relatedRoute: '/production/tasks',
        relatedId: id,
        sourceOperator: get().currentUser.name,
        sourceTimestamp: now(),
      });
    }
    if (status === 'completed') {
      get().addMessage({
        type: 'dispatch',
        title: '生产任务已完成',
        content: `${task.miningFaceName}任务单已完成，目标产量${task.target}吨`,
        sender: '生产调度系统',
        recipients: ['调度员-李明'],
        level: 'info',
        hasVoucher: true,
        voucherUrl: `/vouchers/DISPATCH-${id}-DONE.pdf`,
        relatedRoute: '/production/tasks',
        relatedId: id,
        sourceOperator: get().currentUser.name,
        sourceTimestamp: now(),
      });
    }
  },
  updateTaskTarget: (id, target) => {
    const task = get().productionTasks.find((t) => t.id === id);
    if (!task) return;
    const oldTarget = task.target;
    set((s) => ({
      productionTasks: s.productionTasks.map((t) => t.id === id ? { ...t, target } : t),
    }));
    get().addAuditLog({
      action: '调整目标产量',
      targetType: 'task',
      targetId: id,
      detail: `${task.miningFaceName}任务目标由${oldTarget}吨调整为${target}吨`,
      route: '/production/tasks',
    });
    get().addMessage({
      type: 'dispatch',
      title: '生产调度变更',
      content: `${task.miningFaceName}任务目标产量由${oldTarget}吨调整为${target}吨，请相关人员确认`,
      sender: '生产调度系统',
      recipients: [task.assigned.join('、') || '相关人员'],
      level: 'info',
      hasVoucher: true,
      voucherUrl: `/vouchers/DISPATCH-${id}.pdf`,
      relatedRoute: '/production/tasks',
      relatedId: id,
    });
  },
  updateTaskAssigned: (id, assigned) => {
    const task = get().productionTasks.find((t) => t.id === id);
    if (!task) return;
    const oldAssigned = task.assigned.join('、');
    set((s) => ({
      productionTasks: s.productionTasks.map((t) => t.id === id ? { ...t, assigned } : t),
    }));
    get().addAuditLog({
      action: '调整负责人',
      targetType: 'task',
      targetId: id,
      detail: `${task.miningFaceName}任务负责人由${oldAssigned || '无'}变更为${assigned.join('、') || '无'}`,
      route: '/production/tasks',
    });
    get().addMessage({
      type: 'dispatch',
      title: '生产调度变更',
      content: `${task.miningFaceName}任务负责人由${oldAssigned || '无'}变更为${assigned.join('、') || '无'}，请相关人员确认`,
      sender: '生产调度系统',
      recipients: assigned,
      level: 'info',
      hasVoucher: true,
      voucherUrl: `/vouchers/DISPATCH-${id}.pdf`,
      relatedRoute: '/production/tasks',
      relatedId: id,
    });
  },

  equipmentList: initEquipment,
  inspectionRecords: initInspections,
  maintenanceOrders: initOrders,
  submitInspection: (eqId, vibration, temperature, notes) => {
    const eq = get().equipmentList.find((e) => e.id === eqId);
    if (!eq) return;
    const ts = now();
    const newRecord: InspectionRecord = {
      id: nextIrId(),
      equipmentId: eqId,
      equipmentName: eq.name,
      inspector: '陈刚',
      timestamp: ts,
      vibration,
      temperature,
      notes,
    };

    let newHealth = eq.healthScore;
    let newLife = eq.remainingLife;
    let newStatus = eq.status;

    if (vibration > 6 || temperature > 90) {
      newHealth = Math.max(0, eq.healthScore - 15);
      newLife = Math.max(0, eq.remainingLife - 8);
      newStatus = 'fault';
    } else if (vibration > 4 || temperature > 80) {
      newHealth = Math.max(0, eq.healthScore - 8);
      newLife = Math.max(0, eq.remainingLife - 3);
      newStatus = 'warning';
    } else {
      newHealth = Math.min(100, eq.healthScore + 2);
      newLife = Math.min(100, eq.remainingLife + 1);
    }

    set((s) => ({
      inspectionRecords: [newRecord, ...s.inspectionRecords],
      equipmentList: s.equipmentList.map((e) =>
        e.id === eqId ? { ...e, healthScore: newHealth, remainingLife: newLife, status: newStatus } : e
      ),
    }));

    get().addAuditLog({
      action: '提交巡检',
      targetType: 'inspection',
      targetId: newRecord.id,
      detail: `${eq.name}巡检：振动${vibration}mm/s，温度${temperature}°C${notes ? '，备注：' + notes : ''}`,
      route: '/equipment/inspection',
    });

    if (vibration > 5 || temperature > 85) {
      const moId = nextMoId();
      const faultDesc = vibration > 5 && temperature > 85
        ? `异常振动(${vibration}mm/s)与高温(${temperature}°C)，设备运行严重异常`
        : vibration > 5
          ? `振动值${vibration}mm/s超过阈值5mm/s，需检修`
          : `温度${temperature}°C超过阈值85°C，需检修`;

      const newOrder: MaintenanceOrder = {
        id: moId,
        equipmentId: eqId,
        equipmentName: eq.name,
        type: vibration > 6 || temperature > 90 ? 'emergency' : 'corrective',
        priority: vibration > 6 || temperature > 90 ? 'high' : 'medium',
        status: 'pending',
        predictedFault: faultDesc,
        recommendedParts: [{ name: '通用检修套件', stock: 5, partNumber: 'MNT-GEN' }],
        createdAt: ts,
        scheduledAt: ts.slice(0, 10) + ' 14:00',
      };
      set((s) => ({
        maintenanceOrders: [newOrder, ...s.maintenanceOrders],
      }));
      get().addAuditLog({
        action: '自动生成工单',
        targetType: 'workorder',
        targetId: moId,
        detail: `${eq.name}巡检异常，自动生成维修工单${moId}`,
        route: '/equipment/workorders',
      });
      get().addMessage({
        type: 'fault',
        title: '设备故障预警',
        content: `${eq.name}检测到${faultDesc}，已自动生成维修工单${moId}`,
        sender: '设备管理系统',
        recipients: ['设备管理员-陈刚'],
        level: vibration > 6 || temperature > 90 ? 'error' : 'warning',
        hasVoucher: true,
        voucherUrl: `/vouchers/WO-${moId}.pdf`,
        relatedRoute: '/equipment/workorders',
        relatedId: moId,
        sourceOperator: get().currentUser.name,
        sourceTimestamp: now(),
      });
    }
  },
  updateWorkOrderStatus: (id, status) => {
    const order = get().maintenanceOrders.find((o) => o.id === id);
    if (!order) return;
    set((s) => ({
      maintenanceOrders: s.maintenanceOrders.map((o) => o.id === id ? { ...o, status } : o),
    }));
    if (status === 'in_progress') {
      set((s) => ({
        equipmentList: s.equipmentList.map((e) =>
          e.id === order.equipmentId ? { ...e, status: 'maintenance' } : e
        ),
      }));
      get().addAuditLog({
        action: '接单',
        targetType: 'workorder',
        targetId: id,
        detail: `${order.equipmentName}维修工单已接单，开始维修`,
        route: '/equipment/workorders',
      });
    }
    if (status === 'completed') {
      set((s) => ({
        equipmentList: s.equipmentList.map((e) =>
          e.id === order.equipmentId ? { ...e, status: 'running', healthScore: Math.min(100, e.healthScore + 20), remainingLife: Math.min(100, e.remainingLife + 10) } : e
        ),
      }));
      get().addAuditLog({
        action: '完成维修',
        targetType: 'workorder',
        targetId: id,
        detail: `${order.equipmentName}维修工单已完成，设备恢复运行`,
        route: '/equipment/workorders',
      });
      get().addMessage({
        type: 'fault',
        title: '维修工单完成通知',
        content: `${order.equipmentName}维修已完成（工单${id}），设备恢复正常运行`,
        sender: '设备管理系统',
        recipients: ['设备管理员-陈刚', '调度员-李明'],
        level: 'info',
        hasVoucher: true,
        voucherUrl: `/vouchers/WO-${id}-DONE.pdf`,
        relatedRoute: '/equipment/workorders',
        relatedId: id,
        sourceOperator: get().currentUser.name,
        sourceTimestamp: now(),
      });
    }
  },

  monitorPoints: initMonitorPoints,
  emergencyEvents: initEmergencies.map((e) => ({
    ...e,
    status: e.status as EmergencyEvent['status'],
    evacuationCount: 0,
    notifiedTeams: [],
    disposalSteps: [
      { name: '确认事故信息', done: false },
      { name: '启动应急广播', done: false },
      { name: '组织人员撤离', done: false },
      { name: '现场处置', done: false },
      { name: '事故原因排查', done: false },
    ],
  })),
  saveThresholds: (updated) => {
    set((s) => {
      const newPoints = s.monitorPoints.map((p) => {
        const u = updated.find((x) => x.id === p.id);
        if (!u) return p;
        const gasT = u.gasThreshold;
        const dustT = u.dustThreshold;
        const gasRatio = p.gasConcentration / gasT;
        const dustRatio = p.dustConcentration / dustT;
        let newStatus: MonitorPoint['status'] = 'normal';
        if (gasRatio > 1 || dustRatio > 1) newStatus = 'critical';
        else if (gasRatio > 0.8 || dustRatio > 0.8) newStatus = 'warning';
        return { ...p, gasThreshold: gasT, dustThreshold: dustT, status: newStatus };
      });
      return { monitorPoints: newPoints };
    });

    get().addAuditLog({
      action: '更新阈值配置',
      targetType: 'threshold',
      targetId: 'thresholds',
      detail: '环境监测阈值已更新，已重新判定各监测点状态',
      route: '/environment/thresholds',
    });

    const points = get().monitorPoints;
    const criticalPoints = points.filter((p) => p.status === 'critical');
    for (const cp of criticalPoints) {
      const existing = get().emergencyEvents.find(
        (e) => (e.status === 'active' || e.status === 'disposal') && e.location === cp.location
      );
      if (!existing) {
        const emId = nextEmId();
        const eventType = cp.gasConcentration > cp.gasThreshold ? 'gas_over' : 'dust_over';
        const newEvent: EmergencyEvent = {
          id: emId,
          type: eventType,
          level: 'critical',
          location: cp.location,
          description: `${cp.name}浓度超过阈值（瓦斯${cp.gasConcentration}%/${cp.gasThreshold}%，粉尘${cp.dustConcentration}/${cp.dustThreshold}mg/m³）`,
          evacuationZones: [cp.location],
          broadcastContent: `${cp.location}区域浓度超标，请立即撤离至安全区域`,
          timestamp: now(),
          status: 'active',
          evacuationCount: 0,
          notifiedTeams: [],
          disposalSteps: [
            { name: '确认事故信息', done: false },
            { name: '启动应急广播', done: false },
            { name: '组织人员撤离', done: false },
            { name: '现场处置', done: false },
            { name: '事故原因排查', done: false },
          ],
        };
        set((s) => ({
          emergencyEvents: [newEvent, ...s.emergencyEvents],
        }));
        get().addMessage({
          type: 'emergency',
          title: '环境浓度超标预警',
          content: `${cp.name}浓度超过阈值，已自动生成应急事件${emId}`,
          sender: '环境监测系统',
          recipients: ['安全员-赵强', '全体井下人员'],
          level: 'critical',
          hasVoucher: true,
          voucherUrl: `/vouchers/EM-${emId}.pdf`,
          relatedRoute: '/environment/emergency',
          relatedId: emId,
        });
      }
    }
  },
  triggerBroadcast: (eventId) => {
    const event = get().emergencyEvents.find((e) => e.id === eventId);
    if (!event) return;
    set((s) => ({
      emergencyEvents: s.emergencyEvents.map((e) =>
        e.id === eventId ? {
          ...e,
          status: 'disposal' as const,
          disposalSteps: (e.disposalSteps || []).map((step, i) =>
            i === 0 || i === 1 ? { ...step, done: true } : step
          ),
        } : e
      ),
    }));
    get().addAuditLog({
      action: '触发应急广播',
      targetType: 'emergency',
      targetId: eventId,
      detail: `${event.location}区域应急广播已触发`,
      route: '/environment/emergency',
    });
    get().addMessage({
      type: 'emergency',
      title: '应急广播-人员撤离通知',
      content: `${event.location}区域应急广播已触发：${event.broadcastContent}`,
      sender: '应急管理系统',
      recipients: ['全体井下人员', '安全员-赵强'],
      level: 'critical',
      hasVoucher: true,
      voucherUrl: `/vouchers/EM-${eventId}-BROADCAST.pdf`,
      relatedRoute: '/environment/emergency',
      relatedId: eventId,
    });
  },
  updateEmergencyDisposal: (eventId, data) => {
    set((s) => ({
      emergencyEvents: s.emergencyEvents.map((e) =>
        e.id === eventId ? { ...e, ...data } : e
      ),
    }));
    get().addAuditLog({
      action: '更新处置信息',
      targetType: 'emergency',
      targetId: eventId,
      detail: `疏散人数: ${data.evacuationCount ?? '未更新'}，已通知班组: ${(data.notifiedTeams || []).join('、') || '未更新'}`,
      route: '/environment/emergency',
    });
  },
  toggleDisposalStep: (eventId, stepIndex) => {
    const event = get().emergencyEvents.find((e) => e.id === eventId);
    if (!event || !event.disposalSteps) return;
    const steps = [...event.disposalSteps];
    steps[stepIndex] = { ...steps[stepIndex], done: !steps[stepIndex].done };
    const allDone = steps.every((s) => s.done);
    set((s) => ({
      emergencyEvents: s.emergencyEvents.map((e) =>
        e.id === eventId ? { ...e, disposalSteps: steps, status: allDone ? e.status : 'disposal' } : e
      ),
    }));
    get().addAuditLog({
      action: steps[stepIndex].done ? `完成步骤: ${steps[stepIndex].name}` : `取消步骤: ${steps[stepIndex].name}`,
      targetType: 'emergency',
      targetId: eventId,
      detail: `处置步骤「${steps[stepIndex].name}」已${steps[stepIndex].done ? '完成' : '取消'}`,
      route: '/environment/emergency',
    });
  },
  closeEmergency: (eventId) => {
    const event = get().emergencyEvents.find((e) => e.id === eventId);
    if (!event) return;
    const ts = now();
    const reportUrl = `/vouchers/EM-${eventId}-REPORT.pdf`;
    const startTs = new Date(event.timestamp.replace(/-/g, '/')).getTime();
    const endTs = new Date(ts.replace(/-/g, '/')).getTime();
    const durationMin = Math.round((endTs - startTs) / 60000);
    const disposalDuration = durationMin >= 60 ? `${Math.floor(durationMin / 60)}小时${durationMin % 60}分钟` : `${durationMin}分钟`;
    const steps = event.disposalSteps || [];
    const doneStepNames = steps.filter((s) => s.done).map((s) => s.name).join('、');
    const reviewConclusion = `${event.location}区域${typeLabels[event.type] || event.type}事件，耗时${disposalDuration}，疏散${event.evacuationCount || 0}人，通知班组${(event.notifiedTeams || []).join('、') || '无'}，完成步骤: ${doneStepNames || '无'}`;
    set((s) => ({
      emergencyEvents: s.emergencyEvents.map((e) =>
        e.id === eventId ? {
          ...e,
          status: 'resolved' as const,
          closedAt: ts,
          closedBy: get().currentUser.name,
          reportUrl,
          disposalSteps: steps.map((step) => ({ ...step, done: true })),
          reviewConclusion,
          disposalDuration,
        } : e
      ),
    }));
    get().addAuditLog({
      action: '关闭应急事件',
      targetType: 'emergency',
      targetId: eventId,
      detail: `${event.location}区域应急事件已关闭，耗时${disposalDuration}，事故报告已生成`,
      route: '/environment/emergency',
    });
    get().addMessage({
      type: 'emergency',
      title: '安全复盘通知',
      content: `${event.location}区域应急事件已关闭处置，事故报告已生成，请相关人员查看复盘。${reviewConclusion}`,
      sender: '应急管理系统',
      recipients: ['安全员-赵强', '调度员-李明', '管理层'],
      level: 'info',
      hasVoucher: true,
      voucherUrl: reportUrl,
      relatedRoute: '/environment/emergency',
      relatedId: eventId,
    });
  },
  createDrillPlan: (eventId) => {
    const event = get().emergencyEvents.find((e) => e.id === eventId);
    if (!event) return;
    const drillId = `DR${String(Date.now()).slice(-6)}`;
    const drill: DrillPlan = {
      id: drillId,
      eventId,
      eventLocation: event.location,
      eventType: event.type,
      eventDescription: event.description,
      createdAt: now(),
      createdBy: get().currentUser.name,
      status: 'notified',
    };
    set((s) => ({ drillPlans: [drill, ...s.drillPlans] }));
    get().addAuditLog({
      action: '创建演练计划',
      targetType: 'drill',
      targetId: drillId,
      detail: `基于事件${eventId}创建演练计划，地点${event.location}`,
      route: '/environment/emergency',
      relatedObjectType: 'emergency',
      relatedObjectId: eventId,
    });
    get().addMessage({
      type: 'drill',
      title: '应急演练计划通知',
      content: `基于${event.location}区域历史事件，已生成应急演练计划${drillId}，请安全员和班组负责人安排演练`,
      sender: '应急管理系统',
      recipients: ['安全员-赵强', '采掘一班', '运输班'],
      level: 'info',
      hasVoucher: false,
      relatedRoute: '/environment/emergency',
      relatedId: eventId,
    });
  },

  oreSamples: initSamples,
  processAdjustments: initAdjustments,

  financeReports: [...initReports],
  generateReport: () => {
    const tasks = get().productionTasks;
    const totalOutput = tasks.filter((t) => t.status === 'completed' || t.status === 'in_progress').reduce((s, t) => s + t.target, 0);
    const orders = get().maintenanceOrders;
    const totalMaintCost = orders.reduce((s, o) => s + (o.type === 'emergency' ? 50000 : o.type === 'corrective' ? 30000 : 15000), 0);
    const oldReport = get().financeReports[0];
    const baseEnergy = oldReport ? oldReport.energyConsumption[oldReport.energyConsumption.length - 1] : { electricity: 295000, water: 15200, fuel: 47000 };
    const energyCost = baseEnergy.electricity * 0.8 + baseEnergy.water * 3 + baseEnergy.fuel * 7;
    const totalCost = totalMaintCost + energyCost + oldReport.maintenanceCosts.reduce((s, c) => s + c.amount, 0);
    const revenue = totalOutput * 180;
    const profit = revenue - totalCost;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;
    const newReport: FinanceReport = {
      id: `FR${String(Date.now()).slice(-6)}`,
      period: '2026年6月（实时）',
      teamOutputs: oldReport.teamOutputs.map((t) => ({ ...t, output: Math.round(t.output * 1.05) })),
      maintenanceCosts: [...oldReport.maintenanceCosts, { category: '新增维修', amount: totalMaintCost }],
      energyConsumption: [...oldReport.energyConsumption, { month: '6月', electricity: baseEnergy.electricity, water: baseEnergy.water, fuel: baseEnergy.fuel }],
      totalRevenue: revenue,
      totalCost,
      profit,
      profitMargin: margin,
      approvalStatus: 'draft',
      rejectReason: undefined,
      approvedBy: undefined,
      approvedAt: undefined,
    };
    set({ financeReports: [newReport] });
    get().addAuditLog({
      action: '生成报表',
      targetType: 'report',
      targetId: newReport.id,
      detail: `${newReport.period}利润报表已生成，利润${(profit / 10000).toFixed(1)}万元`,
      route: '/finance/report',
    });
  },
  pushReportToManagement: () => {
    const report = get().financeReports[0];
    if (!report) return;
    set((s) => ({
      financeReports: s.financeReports.map((r) =>
        r.id === report.id ? { ...r, approvalStatus: 'pending' as const } : r
      ),
    }));
    get().addAuditLog({
      action: '推送管理层审批',
      targetType: 'report',
      targetId: report.id,
      detail: `${report.period}利润报表已推送管理层，等待审批`,
      route: '/finance/report',
    });
    get().addMessage({
      type: 'approval',
      title: `${report.period}利润报表待审批`,
      content: `利润${(report.profit / 10000).toFixed(1)}万元，利润率${report.profitMargin}%，请审批`,
      sender: '财务分析系统',
      recipients: ['管理层'],
      level: 'info',
      hasVoucher: true,
      voucherUrl: `/vouchers/REPORT-${report.id}.pdf`,
      relatedRoute: '/finance/report',
      relatedId: report.id,
    });
  },
  approveReport: () => {
    const report = get().financeReports[0];
    if (!report || report.approvalStatus !== 'pending') return;
    const ts = now();
    set((s) => ({
      financeReports: s.financeReports.map((r) =>
        r.id === report.id ? { ...r, approvalStatus: 'approved' as const, approvedBy: '管理层-张总', approvedAt: ts } : r
      ),
    }));
    get().addAuditLog({
      action: '审批通过',
      targetType: 'report',
      targetId: report.id,
      detail: `${report.period}利润报表已审批通过`,
      route: '/finance/report',
    });
    get().addMessage({
      type: 'report',
      title: '报表审批通过',
      content: `${report.period}利润报表已通过审批，可导出正式PDF`,
      sender: '财务分析系统',
      recipients: ['调度员-李明'],
      level: 'info',
      hasVoucher: true,
      voucherUrl: `/vouchers/REPORT-${report.id}-APPROVED.pdf`,
      relatedRoute: '/finance/report',
      relatedId: report.id,
    });
  },
  rejectReport: (reason) => {
    const report = get().financeReports[0];
    if (!report || report.approvalStatus !== 'pending') return;
    const ts = now();
    set((s) => ({
      financeReports: s.financeReports.map((r) =>
        r.id === report.id ? { ...r, approvalStatus: 'rejected' as const, rejectReason: reason, approvedBy: '管理层-张总', approvedAt: ts } : r
      ),
    }));
    get().addAuditLog({
      action: '审批驳回',
      targetType: 'report',
      targetId: report.id,
      detail: `${report.period}利润报表被驳回，原因：${reason}`,
      route: '/finance/report',
    });
    get().addMessage({
      type: 'report',
      title: '报表审批驳回',
      content: `${report.period}利润报表被驳回，原因：${reason}，请修改后重新提交`,
      sender: '财务分析系统',
      recipients: ['调度员-李明'],
      level: 'warning',
      hasVoucher: false,
      relatedRoute: '/finance/report',
      relatedId: report.id,
    });
  },
  exportPdf: () => {
    const report = get().financeReports[0];
    if (!report) return;
    const ts = now();
    get().addMessage({
      type: 'report',
      title: '利润报表PDF正式版导出',
      content: `${report.period}利润报表PDF【正式版】已导出，利润${(report.profit / 10000).toFixed(1)}万元，利润率${report.profitMargin}%，导出人：${get().currentUser.name}，导出时间：${ts}`,
      sender: '财务分析系统',
      recipients: ['调度员-李明', '管理层'],
      level: 'info',
      hasVoucher: true,
      voucherUrl: `/vouchers/REPORT-${report.id}-FORMAL.pdf`,
      relatedRoute: '/finance/report',
      relatedId: report.id,
      sourceOperator: get().currentUser.name,
      sourceTimestamp: ts,
    });
    get().addAuditLog({
      action: '导出PDF正式版',
      targetType: 'report',
      targetId: report.id,
      detail: `${report.period}利润报表PDF正式版已导出`,
      route: '/finance/report',
    });
  },

  messages: initMessages,
  readMessageIds: loadReadIds(),
  unreadCount: recalcUnread(initMessages, loadReadIds()),
  markMessageRead: (id) => {
    const current = get().readMessageIds;
    if (current.includes(id)) return;
    const newReadIds = [...current, id];
    saveReadIds(newReadIds);
    set({
      readMessageIds: newReadIds,
      unreadCount: recalcUnread(get().messages, newReadIds),
    });
  },
  markAllRead: () => {
    const allIds = get().messages.map((m) => m.id);
    saveReadIds(allIds);
    set({
      readMessageIds: allIds,
      unreadCount: 0,
    });
  },
  confirmMessage: (id) => {
    const msg = get().messages.find((m) => m.id === id);
    if (!msg) return;
    const ts = now();
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, confirmedBy: get().currentUser.name, confirmedAt: ts } : m
      ),
    }));
    if (!get().readMessageIds.includes(id)) {
      const newReadIds = [...get().readMessageIds, id];
      saveReadIds(newReadIds);
      set({
        readMessageIds: newReadIds,
        unreadCount: recalcUnread(get().messages, newReadIds),
      });
    }
    get().addAuditLog({
      action: '确认告警',
      targetType: 'message',
      targetId: id,
      detail: `已确认消息「${msg.title}」`,
    });
  },
  addMessage: (msg) => {
    const newMsg: Message = {
      ...msg,
      id: nextMsgId(),
      timestamp: now(),
      read: false,
    };
    set((s) => ({
      messages: [newMsg, ...s.messages],
      unreadCount: recalcUnread([newMsg, ...s.messages], s.readMessageIds),
    }));
  },

  auditLogs: [],
  drillPlans: [],
  addAuditLog: (log) => {
    const newLog: AuditLog = {
      ...log,
      id: nextAlId(),
      timestamp: now(),
      operator: get().currentUser.name,
    };
    set((s) => ({ auditLogs: [newLog, ...s.auditLogs] }));
  },
}));
