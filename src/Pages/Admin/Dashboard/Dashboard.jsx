import React from 'react'
import DashboardHeader from './Dashboardheader'
import StatsCards from './StatsCards'
import WeeklyTrendChart from './Weeklytrendchart'
import DepartmentPieChart from './DepartmentPieChart'
import RecentAttendance from './RecentAttendance'

const Dashboard = () => {
  return (
    <>
      <DashboardHeader/>

      <StatsCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <WeeklyTrendChart />
        <DepartmentPieChart />
      </div>

      <RecentAttendance />

    </>
  )
}

export default Dashboard
