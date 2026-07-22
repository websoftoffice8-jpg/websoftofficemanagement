import { useEffect, useState } from "react";
import api from '../../../API/Axios'
import ENDPOINTS from '../../../API/endpoints'

import DashboardHeader from "./DashboardHeader";
import StatsCards from "./StatsCards";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [employeeRes, attendanceRes] = await Promise.all([
        api.get(ENDPOINTS.EMPLOYEES),
        api.get(ENDPOINTS.ATTENDANCE),
      ]);

      setEmployees(employeeRes.data);
      setAttendance(attendanceRes.data);
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
      />
    </>
  );
}