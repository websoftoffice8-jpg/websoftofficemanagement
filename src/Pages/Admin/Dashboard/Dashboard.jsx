import { useEffect, useState } from "react";
import api from '../../../API/Axios'
import ENDPOINTS from '../../../API/endpoints'
import DepartmentPieChart from "./DepartmentPieChart";
import WeeklyTrendChart from './WeeklyTrendChart'
import RecentAttendance from "./RecentAttendance";

import DashboardHeader from "./DashboardHeader";
import StatsCards from "./StatsCards";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
  try {
    const [employeeRes, attendanceRes, permissionRes] = await Promise.all([
      api.get(ENDPOINTS.EMPLOYEES),
      api.get(ENDPOINTS.ATTENDANCE),
      api.get(ENDPOINTS.PERMISSIONS),
    ]);

    setEmployees(employeeRes.data);
    setAttendance(attendanceRes.data);
    setPermissions(permissionRes.data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <DashboardHeader />
      <StatsCards
        employees={employees}
        attendance={attendance}
         permissions={permissions}
      />

      
      {/* 40 / 60 split: pie chart takes 2fr, trend chart takes 3fr,
          so trend chart reads as the larger, primary panel. */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_4fr] gap-6">
        <DepartmentPieChart />
        <WeeklyTrendChart />
      </div>
        <div className="mt-10">
           <RecentAttendance attendance={attendance} />
        </div>
     


    </>
  )
}