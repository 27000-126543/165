import type { MonitorPoint, EmergencyEvent } from '@/types';

const generateHistory = () => {
  const history = [];
  const now = new Date('2026-06-09T14:00:00');
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000);
    history.push({
      timestamp: `${t.getHours().toString().padStart(2, '0')}:00`,
      gas: Math.round((0.3 + Math.random() * 0.6) * 100) / 100,
      dust: Math.round((2 + Math.random() * 5) * 10) / 10,
    });
  }
  return history;
};

export const monitorPoints: MonitorPoint[] = [
  { id: 'MP001', name: 'A3采掘面监测站', location: 'A3采掘面', gasConcentration: 0.45, dustConcentration: 4.2, gasThreshold: 1.0, dustThreshold: 6.0, status: 'normal', history: generateHistory() },
  { id: 'MP002', name: 'B1采掘面监测站', location: 'B1采掘面', gasConcentration: 0.82, dustConcentration: 5.8, gasThreshold: 1.0, dustThreshold: 6.0, status: 'warning', history: generateHistory() },
  { id: 'MP003', name: '主运输巷监测站', location: '主运输巷', gasConcentration: 0.25, dustConcentration: 3.1, gasThreshold: 1.0, dustThreshold: 6.0, status: 'normal', history: generateHistory() },
  { id: 'MP004', name: '通风巷监测站', location: '通风巷', gasConcentration: 1.15, dustConcentration: 6.8, gasThreshold: 1.0, dustThreshold: 6.0, status: 'critical', history: generateHistory() },
  { id: 'MP005', name: '中央变电所监测站', location: '中央变电所', gasConcentration: 0.15, dustConcentration: 2.0, gasThreshold: 0.5, dustThreshold: 4.0, status: 'normal', history: generateHistory() },
  { id: 'MP006', name: 'D1采掘面监测站', location: 'D1采掘面', gasConcentration: 0.68, dustConcentration: 5.2, gasThreshold: 1.0, dustThreshold: 6.0, status: 'normal', history: generateHistory() },
];

export const emergencyEvents: EmergencyEvent[] = [
  { id: 'EM001', type: 'gas_over', level: 'critical', location: '通风巷', description: '通风巷监测站瓦斯浓度连续3分钟超过1.0%阈值', evacuationZones: ['通风巷', 'B1采掘面'], broadcastContent: '通风巷区域瓦斯超标，请立即沿安全通道撤离至主井口', timestamp: '2026-06-09 13:45:00', status: 'active' },
  { id: 'EM002', type: 'dust_over', level: 'warning', location: 'B1采掘面', description: 'B1采掘面粉尘浓度接近超标限值', evacuationZones: [], broadcastContent: 'B1采掘面粉尘偏高，请加强通风并佩戴防护设备', timestamp: '2026-06-09 12:30:00', status: 'active' },
  { id: 'EM003', type: 'gas_over', level: 'emergency', location: 'D1采掘面', description: 'D1采掘面瓦斯浓度突然升高至1.5%', evacuationZones: ['D1采掘面', '通风巷'], broadcastContent: '紧急！D1采掘面瓦斯严重超标，全体人员立即撤离！', timestamp: '2026-06-08 15:20:00', status: 'resolved', reportUrl: '/reports/EM003.pdf' },
  { id: 'EM004', type: 'collapse', level: 'emergency', location: 'A1废弃巷道', description: 'A1废弃巷道发生局部坍塌', evacuationZones: ['A1废弃巷道', 'A2采空区'], broadcastContent: 'A1巷道坍塌，周边区域人员立即撤离', timestamp: '2026-06-07 09:10:00', status: 'resolved', reportUrl: '/reports/EM004.pdf' },
];
