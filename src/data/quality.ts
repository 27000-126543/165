import type { OreSample, ProcessAdjustment } from '@/types';

export const oreSamples: OreSample[] = [
  { id: 'OS001', sampleDate: '2026-06-09', location: 'A3采掘面', collector: '王海波', data: { feContent: 62.5, sContent: 0.8, moisture: 3.2, granularity: 15 }, grade: 'premium', gradeScore: 95, processParams: { crushSize: 12, flotationTime: 8.5, reagentDosage: 2.1 } },
  { id: 'OS002', sampleDate: '2026-06-09', location: 'B1采掘面', collector: '刘伟', data: { feContent: 48.3, sContent: 1.5, moisture: 5.8, granularity: 22 }, grade: 'grade_b', gradeScore: 68, processParams: { crushSize: 18, flotationTime: 12.0, reagentDosage: 3.5 } },
  { id: 'OS003', sampleDate: '2026-06-09', location: 'D1采掘面', collector: '吴超', data: { feContent: 58.7, sContent: 0.5, moisture: 2.8, granularity: 12 }, grade: 'grade_a', gradeScore: 85, processParams: { crushSize: 14, flotationTime: 9.0, reagentDosage: 2.3 } },
  { id: 'OS004', sampleDate: '2026-06-08', location: 'C2采掘面', collector: '王海波', data: { feContent: 35.2, sContent: 2.8, moisture: 8.5, granularity: 30 }, grade: 'low', gradeScore: 35, processParams: { crushSize: 25, flotationTime: 15.0, reagentDosage: 5.0 } },
  { id: 'OS005', sampleDate: '2026-06-08', location: 'A3采掘面', collector: '刘伟', data: { feContent: 55.1, sContent: 1.0, moisture: 4.0, granularity: 18 }, grade: 'grade_a', gradeScore: 80, processParams: { crushSize: 15, flotationTime: 10.0, reagentDosage: 2.8 } },
  { id: 'OS006', sampleDate: '2026-06-07', location: 'E2采掘面', collector: '吴超', data: { feContent: 42.0, sContent: 2.0, moisture: 6.5, granularity: 25 }, grade: 'grade_c', gradeScore: 52, processParams: { crushSize: 20, flotationTime: 13.0, reagentDosage: 4.0 } },
];

export const processAdjustments: ProcessAdjustment[] = [
  { id: 'PA001', sampleId: 'OS001', parameter: 'crushSize', oldValue: 15, newValue: 12, reason: '高品位矿石，减小破碎粒度提升选矿回收率', timestamp: '2026-06-09 10:30', operator: '系统自动' },
  { id: 'PA002', sampleId: 'OS002', parameter: 'flotationTime', oldValue: 10.0, newValue: 12.0, reason: '中低品位矿石，延长浮选时间提高回收率', timestamp: '2026-06-09 11:00', operator: '系统自动' },
  { id: 'PA003', sampleId: 'OS002', parameter: 'reagentDosage', oldValue: 2.5, newValue: 3.5, reason: '硫含量偏高，增加药剂用量抑制硫化矿物', timestamp: '2026-06-09 11:05', operator: '系统自动' },
  { id: 'PA004', sampleId: 'OS004', parameter: 'crushSize', oldValue: 18, newValue: 25, reason: '低品位矿石，降低破碎细度节省能耗', timestamp: '2026-06-08 14:20', operator: '质量检测员-王海波' },
  { id: 'PA005', sampleId: 'OS003', parameter: 'flotationTime', oldValue: 8.5, newValue: 9.0, reason: '微调浮选参数优化指标', timestamp: '2026-06-09 10:45', operator: '系统自动' },
];
