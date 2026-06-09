import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import AccessList from '@/pages/safety/AccessList';
import AccessDetail from '@/pages/safety/AccessDetail';
import Positioning from '@/pages/safety/Positioning';
import Alarms from '@/pages/safety/Alarms';
import Monitor from '@/pages/production/Monitor';
import Vehicles from '@/pages/production/Vehicles';
import Tasks from '@/pages/production/Tasks';
import EquipmentList from '@/pages/equipment/EquipmentList';
import Inspection from '@/pages/equipment/Inspection';
import Prediction from '@/pages/equipment/Prediction';
import WorkOrders from '@/pages/equipment/WorkOrders';
import EnvMonitor from '@/pages/environment/Monitor';
import Thresholds from '@/pages/environment/Thresholds';
import Emergency from '@/pages/environment/Emergency';
import Samples from '@/pages/quality/Samples';
import Grade from '@/pages/quality/Grade';
import Params from '@/pages/quality/Params';
import FinanceProduction from '@/pages/finance/Production';
import Cost from '@/pages/finance/Cost';
import Report from '@/pages/finance/Report';
import Messages from '@/pages/Messages';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/safety/access" element={<AccessList />} />
          <Route path="/safety/access/:id" element={<AccessDetail />} />
          <Route path="/safety/positioning" element={<Positioning />} />
          <Route path="/safety/alarms" element={<Alarms />} />
          <Route path="/production/monitor" element={<Monitor />} />
          <Route path="/production/vehicles" element={<Vehicles />} />
          <Route path="/production/tasks" element={<Tasks />} />
          <Route path="/equipment/list" element={<EquipmentList />} />
          <Route path="/equipment/inspection" element={<Inspection />} />
          <Route path="/equipment/prediction" element={<Prediction />} />
          <Route path="/equipment/workorders" element={<WorkOrders />} />
          <Route path="/environment/monitor" element={<EnvMonitor />} />
          <Route path="/environment/thresholds" element={<Thresholds />} />
          <Route path="/environment/emergency" element={<Emergency />} />
          <Route path="/quality/samples" element={<Samples />} />
          <Route path="/quality/grade" element={<Grade />} />
          <Route path="/quality/params" element={<Params />} />
          <Route path="/finance/production" element={<FinanceProduction />} />
          <Route path="/finance/cost" element={<Cost />} />
          <Route path="/finance/report" element={<Report />} />
          <Route path="/messages" element={<Messages />} />
        </Route>
      </Routes>
    </Router>
  );
}
