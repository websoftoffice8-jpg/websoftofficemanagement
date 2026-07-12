import React, { useState, useEffect } from 'react'
import { ShieldCheck, UserPlus, Users, Hash, User, Lock } from 'lucide-react'

const API_URL = 'http://localhost:3000/users'
// const CURRENT_USER_KEY = 'currentUser'

const fetchUsers = async () => {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error('Failed to load users')
  return res.json()
}

const createUser = async (user) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
  if (!res.ok) throw new Error('Failed to create user')
  return res.json()
}

const generateId = () => Math.random().toString(36).slice(2, 12)

const Settings = () => {
  const [users, setUsers] = useState([])
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    employeeId: '',
    name: '',
    password: '',
  })
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const allUsers = await fetchUsers();
        setUsers(allUsers);

        const loggedInUser = JSON.parse(localStorage.getItem("user"));

        const admin = allUsers.find(
          (u) =>
            u.id === loggedInUser?.id &&
            u.role === "admin"
        );

        setCurrentAdmin(admin || null);
      } catch (err) {
        setLoadError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const admins = users.filter((u) => u.role === 'admin')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFormError('')
    setSuccessMsg('')
  }

  const handleAddAdmin = async (e) => {
    e.preventDefault()
    const employeeId = form.employeeId.trim()
    const name = form.name.trim()
    const password = form.password.trim()

    if (!employeeId || !name || !password) {
      setFormError('All fields are required.')
      return
    }

    const alreadyExists = users.some(
      (u) => u.employeeId.toLowerCase() === employeeId.toLowerCase()
    )
    if (alreadyExists) {
      setFormError('An account with this Employee ID already exists.')
      return
    }

    const newAdmin = {
      employeeId,
      name,
      password,
      role: 'admin',
      id: generateId(),
    }

    setSubmitting(true)
    try {
      const created = await createUser(newAdmin)
      setUsers((prev) => [...prev, created])
      setForm({ employeeId: '', name: '', password: '' })
      setSuccessMsg(`${name} has been added as an admin and can now log in.`)
    } catch (err) {
      setFormError('Could not add admin — check the server and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // account delete 

  const handleDeleteAdmin = async () => {
    if (!currentAdmin) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your admin account?"
    );

    if (!confirmDelete) return;

    try {
      await fetch(`${API_URL}/${currentAdmin.id}`, {
        method: "DELETE",
      });

      // Clear login
      localStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "/";
    } catch (err) {
      alert("Failed to delete admin.");
    }
  };


  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-8">
        <p className="text-slate-400 text-sm">Loading…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-8">
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
          {loadError}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-sm shadow-green-600/25">
          <ShieldCheck size={20} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Admin Settings
          </h1>
          <p className="text-sm text-slate-400">Manage administrator access to the system.</p>
        </div>
      </div>

      {/* Current admin details */}
      <section className="bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] p-6 mb-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-4">
          <User size={16} className="text-green-600" />
          Your Admin Details
        </h2>
            
        {currentAdmin ? (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-slate-400 text-sm">Name</span>
              <span className="font-medium text-slate-700">{currentAdmin.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-slate-400 text-sm">Admin ID</span>
              <span className="font-mono text-[13px] font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md">
                {currentAdmin.employeeId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Password</span>
              <span className="font-medium text-slate-700 flex items-center gap-2.5">
                <span className="font-mono tracking-wider">
                  {showPassword ? currentAdmin.password : '•'.repeat(currentAdmin.password.length)}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-green-600 font-semibold text-xs hover:text-green-700 transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No admin is currently logged in.</p>
        )}
      </section>

      {/* Add new admin */}
      <section className="bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] p-6 mb-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-4">
          <UserPlus size={16} className="text-green-600" />
          Add New Admin
        </h2>
        <form onSubmit={handleAddAdmin} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-slate-600">Employee ID</label>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                placeholder="e.g. EMP04"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-slate-600">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Priya Nair"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-slate-600">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Set a password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {formError && (
            <p className="text-red-600 text-[13px] bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
              {formError}
            </p>
          )}
          {successMsg && (
            <p className="text-green-700 text-[13px] bg-green-50 border border-green-200 rounded-xl px-3.5 py-2">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 self-start px-5 py-2.5 rounded-xl hover:cursor-pointer  bg-green-600 text-white text-sm font-semibold shadow-sm shadow-green-600/25 hover:bg-green-700 hover:shadow-md hover:shadow-green-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Adding…' : 'Add Admin'}
          </button>
        </form>
      </section>

      {/* Existing admins list */}
      <section className="bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-4">
          <Users size={16} className="text-green-600" />
          Current Admins
          <span className="ml-auto text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
            {admins.length}
          </span>
        </h2>
        <ul className="flex flex-col gap-1">
          {admins.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 px-2 -mx-2 py-2.5 border-b border-slate-100 last:border-b-0 text-sm rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="w-8 h-8 shrink-0 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                {a.name.charAt(0).toUpperCase()}
              </span>
              <span className="font-medium text-slate-700 flex-1">{a.name}</span>
              <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded-md">
                {a.employeeId}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleDeleteAdmin}
          className="rounded-lg bg-green-600  hover:cursor-pointer px-5 py-2.5 font-semibold   text-white transition "
        >
          Delete Admin
        </button>
      </div>

    </div>
  )
}

export default Settings