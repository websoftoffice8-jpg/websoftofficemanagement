import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";

import ProfileSummary from "./ProfileSummary";
import TodayStatus from "./TodayStatus";
import HolidayBanner from "./HolidayBanner";
import NoticeBoard from "./NoticeBoard";
import StatsCards from "./StatsCards";
import LeaveStatus from "./LeaveStatus";

function getUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const [attendance, setAttendance] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = getUser();

  useEffect(() => {
    if (!user) {
      setError("Couldn't find your session. Please log in again.");
      setLoading(false);
      return;
    }

    async function fetchDashboardData() {
      try {
        const [attendanceRes, permissionRes, holidayRes] = await Promise.all([
          api.get(`${ENDPOINTS.ATTENDANCE}?employeeId=${user.employeeId}`),
          api.get(`${ENDPOINTS.PERMISSIONS}?employeeId=${user.employeeId}`),
          api.get(ENDPOINTS.HOLIDAYS),
        ]);

        setAttendance(attendanceRes.data);
        setPermissions(permissionRes.data);
        setHolidays(holidayRes.data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setError("Couldn't load your dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading your dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[60vh] px-4">
        <div className="flex flex-col items-center text-center gap-3 max-w-sm">
          <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-slate-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <HolidayBanner holidays={holidays} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProfileSummary user={user} />
          </div>
          <TodayStatus
            attendance={attendance}
            permissions={permissions}
            holidays={holidays}
            employeeId={user.employeeId}
          />
        </div>

        <StatsCards
          attendance={attendance}
          permissions={permissions}
          employeeId={user.employeeId}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NoticeBoard holidays={holidays} />
          <LeaveStatus permissions={permissions} employeeId={user.employeeId} />
        </div>
      </div>
    </div>
  );
}