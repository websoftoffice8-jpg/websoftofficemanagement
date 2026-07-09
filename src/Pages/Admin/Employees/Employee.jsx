// src/components/employees/Employees.jsx

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import EmployeeToolbar from "./EmployeeToolbar";
import EmployeeTable from "./EmployeeTable";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState(""); // filters against emp.role (see note below)

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:3000/users");
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (formData) => {
    try {
      const res = await axios.post("http://localhost:3000/users", formData);
      setEmployees((prev) => [...prev, res.data]);
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  const handleEmployeeUpdated = (updatedEmployee) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
    );
  };

  const handleEmployeeDeleted = (id) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  // Unique department list derived from live data, so the dropdown
  // always reflects what's actually in the dataset.
  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department))].filter(Boolean).sort(),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();

    return employees.filter((emp) => {
      const matchesSearch =
        q === "" ||
        emp.name?.toLowerCase().includes(q) ||
        emp.employeeId?.toLowerCase().includes(q) ||
        emp.position?.toLowerCase().includes(q);

      const matchesDepartment = department === "" || emp.department === department;

      // NOTE: your data has no "status" field, only "role"
      // (admin / employee / intern). Filtering role here under the
      // "status" name so the existing toolbar UI works as-is.
      const matchesStatus = status === "" || emp.role === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, search, department, status]);

  return (
    <div>
      <EmployeeToolbar
        search={search}
        setSearch={setSearch}
        department={department}
        setDepartment={setDepartment}
        status={status}
        setStatus={setStatus}
        departments={departments}
        onAddEmployee={handleAddEmployee}
      />
      <EmployeeTable
        employees={filteredEmployees}
        onEmployeeUpdated={handleEmployeeUpdated}
        onEmployeeDeleted={handleEmployeeDeleted}
      />
    </div>
  );
};

export default Employees;