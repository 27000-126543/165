import type { Equipment, InspectionRecord, MaintenanceOrder } from '@/types';

export const equipmentList: Equipment[] = [
  { id: 'EQ001', name: '采煤机-01', model: 'MG400/930-WD', type: '采煤机', installDate: '2023-03-15', status: 'running', location: 'A3采掘面', remainingLife: 78, healthScore: 85 },
  { id: 'EQ002', name: '液压支架-01', model: 'ZY6800/18/38', type: '液压支架', installDate: '2022-08-20', status: 'warning', location: 'A3采掘面', remainingLife: 45, healthScore: 62 },
  { id: 'EQ003', name: '刮板输送机-01', model: 'SGZ764/630', type: '输送机', installDate: '2023-06-10', status: 'running', location: 'A3采掘面', remainingLife: 65, healthScore: 78 },
  { id: 'EQ004', name: '掘进机-01', model: 'EBZ200', type: '掘进机', installDate: '2024-01-05', status: 'running', location: 'B1采掘面', remainingLife: 82, healthScore: 90 },
  { id: 'EQ005', name: '主通风机-01', model: 'FBCDZ-8-No26', type: '通风机', installDate: '2021-12-01', status: 'running', location: '通风井', remainingLife: 35, healthScore: 55 },
  { id: 'EQ006', name: '排水泵-01', model: 'MD450-60×8', type: '水泵', installDate: '2022-05-18', status: 'fault', location: '中央水泵房', remainingLife: 12, healthScore: 28 },
  { id: 'EQ007', name: '带式输送机-01', model: 'DSJ100/63/2×200', type: '输送机', installDate: '2023-09-22', status: 'idle', location: '主运输巷', remainingLife: 70, healthScore: 82 },
  { id: 'EQ008', name: '采煤机-02', model: 'MG250/600-WD', type: '采煤机', installDate: '2024-04-10', status: 'maintenance', location: 'D1采掘面', remainingLife: 88, healthScore: 92 },
  { id: 'EQ009', name: '提升机-01', model: 'JKM-2.8×6', type: '提升机', installDate: '2020-07-15', status: 'running', location: '主井', remainingLife: 28, healthScore: 48 },
  { id: 'EQ010', name: '空压机-01', model: 'SA-220A', type: '空压机', installDate: '2023-11-08', status: 'running', location: '压风机房', remainingLife: 72, healthScore: 80 },
];

export const inspectionRecords: InspectionRecord[] = [
  { id: 'IR001', equipmentId: 'EQ001', equipmentName: '采煤机-01', inspector: '陈刚', timestamp: '2026-06-09 08:00', vibration: 2.3, temperature: 65, notes: '运行正常，轻微振动' },
  { id: 'IR002', equipmentId: 'EQ002', equipmentName: '液压支架-01', inspector: '黄振', timestamp: '2026-06-09 08:15', vibration: 4.8, temperature: 78, notes: '振动偏大，需关注' },
  { id: 'IR003', equipmentId: 'EQ005', equipmentName: '主通风机-01', inspector: '杨鹏飞', timestamp: '2026-06-09 07:30', vibration: 3.5, temperature: 72, notes: '温度偏高，建议加强监测' },
  { id: 'IR004', equipmentId: 'EQ006', equipmentName: '排水泵-01', inspector: '陈刚', timestamp: '2026-06-09 09:00', vibration: 8.2, temperature: 95, notes: '异常振动，温度过高，需立即维修' },
  { id: 'IR005', equipmentId: 'EQ009', equipmentName: '提升机-01', inspector: '黄振', timestamp: '2026-06-08 16:00', vibration: 5.1, temperature: 80, notes: '振动值超限，建议安排检修' },
  { id: 'IR006', equipmentId: 'EQ001', equipmentName: '采煤机-01', inspector: '陈刚', timestamp: '2026-06-08 08:00', vibration: 2.1, temperature: 63, notes: '运行正常' },
  { id: 'IR007', equipmentId: 'EQ003', equipmentName: '刮板输送机-01', inspector: '杨鹏飞', timestamp: '2026-06-09 08:30', vibration: 2.8, temperature: 58, notes: '运行正常' },
  { id: 'IR008', equipmentId: 'EQ010', equipmentName: '空压机-01', inspector: '陈刚', timestamp: '2026-06-09 07:45', vibration: 1.9, temperature: 55, notes: '运行正常' },
];

export const maintenanceOrders: MaintenanceOrder[] = [
  { id: 'MO001', equipmentId: 'EQ006', equipmentName: '排水泵-01', type: 'emergency', priority: 'high', status: 'pending', predictedFault: '轴承磨损导致振动异常，密封件老化', recommendedParts: [{ name: '轴承组件', stock: 3, partNumber: 'BRG-450' }, { name: '机械密封件', stock: 5, partNumber: 'SEL-220' }, { name: 'O型密封圈', stock: 12, partNumber: 'ORI-100' }], createdAt: '2026-06-09 09:15', scheduledAt: '2026-06-09 14:00' },
  { id: 'MO002', equipmentId: 'EQ002', equipmentName: '液压支架-01', type: 'preventive', priority: 'medium', status: 'pending', predictedFault: '液压缸密封下降，预计30天内泄漏风险', recommendedParts: [{ name: '液压缸密封套件', stock: 2, partNumber: 'HYD-680' }, { name: '高压油管', stock: 8, partNumber: 'HOS-350' }], createdAt: '2026-06-09 10:00', scheduledAt: '2026-06-12 08:00' },
  { id: 'MO003', equipmentId: 'EQ009', equipmentName: '提升机-01', type: 'corrective', priority: 'high', status: 'in_progress', predictedFault: '减速器齿轮磨损', recommendedParts: [{ name: '减速器齿轮组', stock: 1, partNumber: 'GER-280' }, { name: '润滑油', stock: 20, partNumber: 'LUB-050' }], createdAt: '2026-06-08 14:00', scheduledAt: '2026-06-09 08:00' },
  { id: 'MO004', equipmentId: 'EQ005', equipmentName: '主通风机-01', type: 'preventive', priority: 'low', status: 'pending', predictedFault: '叶片积灰导致效率下降', recommendedParts: [{ name: '风机叶片', stock: 6, partNumber: 'BLD-260' }], createdAt: '2026-06-09 11:00', scheduledAt: '2026-06-15 08:00' },
  { id: 'MO005', equipmentId: 'EQ008', equipmentName: '采煤机-02', type: 'corrective', priority: 'medium', status: 'completed', predictedFault: '截割电机过热保护', recommendedParts: [{ name: '温度传感器', stock: 4, partNumber: 'SNS-100' }], createdAt: '2026-06-07 10:00', scheduledAt: '2026-06-08 08:00' },
];
