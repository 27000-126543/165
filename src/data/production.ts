import type { MiningFace, Vehicle, ProductionTask } from '@/types';

export const miningFaces: MiningFace[] = [
  { id: 'MF001', name: 'A3采掘面', type: 'coal', dailyTarget: 1200, currentOutput: 856, unit: '吨', status: 'active', oreGrade: 0.85 },
  { id: 'MF002', name: 'B1采掘面', type: 'coal', dailyTarget: 800, currentOutput: 620, unit: '吨', status: 'active', oreGrade: 0.72 },
  { id: 'MF003', name: 'C2采掘面', type: 'metal', dailyTarget: 500, currentOutput: 0, unit: '吨', status: 'idle', oreGrade: 0.68 },
  { id: 'MF004', name: 'D1采掘面', type: 'coal', dailyTarget: 1000, currentOutput: 980, unit: '吨', status: 'active', oreGrade: 0.91 },
  { id: 'MF005', name: 'E2采掘面', type: 'metal', dailyTarget: 600, currentOutput: 0, unit: '吨', status: 'maintenance', oreGrade: 0.55 },
];

export const vehicles: Vehicle[] = [
  { id: 'V001', plateNumber: '矿运-001', type: 'shovel', status: 'running', position: { x: 300, y: 300 }, route: [{ x: 300, y: 300 }, { x: 400, y: 250 }, { x: 500, y: 200 }], optimizedRoute: [{ x: 300, y: 300 }, { x: 350, y: 280 }, { x: 500, y: 200 }], loadCapacity: 50, currentLoad: 35, driver: '赵明远' },
  { id: 'V002', plateNumber: '矿运-002', type: 'transport', status: 'running', position: { x: 500, y: 200 }, route: [{ x: 500, y: 200 }, { x: 550, y: 150 }, { x: 600, y: 100 }], optimizedRoute: [{ x: 500, y: 200 }, { x: 520, y: 170 }, { x: 600, y: 100 }], loadCapacity: 80, currentLoad: 65, driver: '周立' },
  { id: 'V003', plateNumber: '矿运-003', type: 'shovel', status: 'idle', position: { x: 200, y: 400 }, route: [], optimizedRoute: [], loadCapacity: 50, currentLoad: 0, driver: '孙磊' },
  { id: 'V004', plateNumber: '矿运-004', type: 'transport', status: 'running', position: { x: 450, y: 350 }, route: [{ x: 450, y: 350 }, { x: 500, y: 300 }, { x: 600, y: 100 }], optimizedRoute: [{ x: 450, y: 350 }, { x: 480, y: 280 }, { x: 600, y: 100 }], loadCapacity: 80, currentLoad: 40, driver: '刘伟' },
  { id: 'V005', plateNumber: '矿运-005', type: 'auxiliary', status: 'maintenance', position: { x: 150, y: 300 }, route: [], optimizedRoute: [], loadCapacity: 30, currentLoad: 0, driver: '黄振' },
  { id: 'V006', plateNumber: '矿运-006', type: 'transport', status: 'running', position: { x: 380, y: 220 }, route: [{ x: 380, y: 220 }, { x: 420, y: 180 }, { x: 600, y: 100 }], optimizedRoute: [{ x: 380, y: 220 }, { x: 400, y: 160 }, { x: 600, y: 100 }], loadCapacity: 80, currentLoad: 72, driver: '郑涛' },
];

export const productionTasks: ProductionTask[] = [
  { id: 'PT001', date: '2026-06-09', miningFaceId: 'MF001', miningFaceName: 'A3采掘面', target: 1200, assigned: ['张建国', '李志强', '孙磊'], status: 'in_progress', priority: 'high' },
  { id: 'PT002', date: '2026-06-09', miningFaceId: 'MF002', miningFaceName: 'B1采掘面', target: 800, assigned: ['刘伟', '吴超'], status: 'in_progress', priority: 'medium' },
  { id: 'PT003', date: '2026-06-09', miningFaceId: 'MF004', miningFaceName: 'D1采掘面', target: 1000, assigned: ['赵明远', '周立'], status: 'in_progress', priority: 'high' },
  { id: 'PT004', date: '2026-06-10', miningFaceId: 'MF001', miningFaceName: 'A3采掘面', target: 1300, assigned: [], status: 'draft', priority: 'high' },
  { id: 'PT005', date: '2026-06-10', miningFaceId: 'MF003', miningFaceName: 'C2采掘面', target: 500, assigned: [], status: 'draft', priority: 'low' },
  { id: 'PT006', date: '2026-06-08', miningFaceId: 'MF004', miningFaceName: 'D1采掘面', target: 1000, assigned: ['赵明远', '周立'], status: 'completed', priority: 'high' },
];
