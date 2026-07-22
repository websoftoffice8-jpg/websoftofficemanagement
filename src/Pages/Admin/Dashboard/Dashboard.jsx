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

      {/* Two equal columns: pie chart occupies the left half,
          trend chart the right half. */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DepartmentPieChart />
        <WeeklyTrendChart />
      </div>

      <RecentAttendance />

    </>
  )
}

export default Dashboard