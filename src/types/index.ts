export interface Miner {
  id: string;
  name: string;
  employeeId: string;
  team: string;
  healthStatus: 'normal' | 'abnormal';
  healthData: {
    bloodPressure: string;
    heartRate: number;
    bloodOxygen: number;
    lastCheckup: string;
  };
  trainingRecords: TrainingRecord[];
  accessStatus: 'approved' | 'rejected' | 'pending';
  currentPosition: { x: number; y: number; zone: string } | null;
  isUnderground: boolean;
}

export interface TrainingRecord {
  id: string;
  course: string;
  completedAt: string;
  validUntil: string;
  passed: boolean;
}

export interface AlarmRecord {
  id: string;
  minerId: string;
  minerName: string;
  zone: string;
  type: 'danger_zone' | 'over_time' | 'distress';
  level: 'warning' | 'critical' | 'emergency';
  message: string;
  rescueCommand: string;
  timestamp: string;
  resolved: boolean;
}

export interface MiningFace {
  id: string;
  name: string;
  type: 'coal' | 'metal';
  dailyTarget: number;
  currentOutput: number;
  unit: string;
  status: 'active' | 'idle' | 'maintenance';
  oreGrade: number;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'shovel' | 'transport' | 'auxiliary';
  status: 'running' | 'idle' | 'maintenance';
  position: { x: number; y: number };
  route: { x: number; y: number }[];
  optimizedRoute: { x: number; y: number }[];
  loadCapacity: number;
  currentLoad: number;
  driver: string;
}

export interface ProductionTask {
  id: string;
  date: string;
  miningFaceId: string;
  miningFaceName: string;
  target: number;
  assigned: string[];
  status: 'draft' | 'issued' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  type: string;
  installDate: string;
  status: 'running' | 'idle' | 'warning' | 'fault' | 'maintenance';
  location: string;
  remainingLife: number;
  healthScore: number;
}

export interface InspectionRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  inspector: string;
  timestamp: string;
  vibration: number;
  temperature: number;
  notes: string;
}

export interface MaintenanceOrder {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'preventive' | 'corrective' | 'emergency';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  predictedFault: string;
  recommendedParts: RecommendedPart[];
  createdAt: string;
  scheduledAt: string;
}

export interface RecommendedPart {
  name: string;
  stock: number;
  partNumber: string;
}

export interface MonitorPoint {
  id: string;
  name: string;
  location: string;
  gasConcentration: number;
  dustConcentration: number;
  gasThreshold: number;
  dustThreshold: number;
  status: 'normal' | 'warning' | 'critical';
  history: EnvDataPoint[];
}

export interface EnvDataPoint {
  timestamp: string;
  gas: number;
  dust: number;
}

export interface AuditLog {
  id: string;
  action: string;
  targetType: 'task' | 'inspection' | 'workorder' | 'emergency' | 'report' | 'threshold' | 'message';
  targetId: string;
  operator: string;
  timestamp: string;
  detail: string;
  route?: string;
}

export interface DisposalStep {
  name: string;
  done: boolean;
}

export interface EmergencyEvent {
  id: string;
  type: 'gas_over' | 'dust_over' | 'collapse' | 'flood';
  level: 'warning' | 'critical' | 'emergency';
  location: string;
  description: string;
  evacuationZones: string[];
  broadcastContent: string;
  timestamp: string;
  status: 'active' | 'disposal' | 'resolved';
  reportUrl?: string;
  evacuationCount?: number;
  notifiedTeams?: string[];
  disposalSteps?: DisposalStep[];
  closedAt?: string;
  closedBy?: string;
}

export interface OreSample {
  id: string;
  sampleDate: string;
  location: string;
  collector: string;
  data: {
    feContent: number;
    sContent: number;
    moisture: number;
    granularity: number;
  };
  grade: 'premium' | 'grade_a' | 'grade_b' | 'grade_c' | 'low' | null;
  gradeScore: number;
  processParams: Record<string, number>;
}

export interface ProcessAdjustment {
  id: string;
  sampleId: string;
  parameter: string;
  oldValue: number;
  newValue: number;
  reason: string;
  timestamp: string;
  operator: string;
}

export interface FinanceReport {
  id: string;
  period: string;
  teamOutputs: TeamOutput[];
  maintenanceCosts: CostCategory[];
  energyConsumption: EnergyData[];
  totalRevenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface TeamOutput {
  team: string;
  output: number;
  target: number;
}

export interface CostCategory {
  category: string;
  amount: number;
}

export interface EnergyData {
  month: string;
  electricity: number;
  water: number;
  fuel: number;
}

export interface Message {
  id: string;
  type: 'access' | 'alarm' | 'fault' | 'quality' | 'dispatch' | 'emergency' | 'report' | 'approval';
  title: string;
  content: string;
  sender: string;
  recipients: string[];
  timestamp: string;
  read: boolean;
  hasVoucher: boolean;
  voucherUrl?: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  confirmedBy?: string;
  confirmedAt?: string;
  relatedRoute?: string;
  relatedId?: string;
}

export interface DangerZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  level: 'warning' | 'critical' | 'restricted';
  description: string;
}
