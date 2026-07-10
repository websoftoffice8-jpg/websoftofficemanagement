import React, { useState, useEffect } from 'react'

// ---- Integration notes ----
// 1. Users are read from / written to your json-server (or similar) REST API
//    at http://localhost:3000/users. Your login component should already be
//    hitting this same endpoint — as long as it is, any admin added here
//    (POST) will be able to log in immediately, since it's the same data
//    source, no separate sync needed.
// 2. Assumes the logged-in user's employeeId is stored in localStorage under
//    "currentUser" (set that at login time if it isn't already). If you're
//    using Context/Auth instead, just swap the one getItem call below.
// 3. If your API base URL differs (different port, deployed host, etc.),
//    update API_URL.

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

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.muted}>Loading…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div style={styles.page}>
        <p style={styles.error}>{loadError}</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Admin Settings</h1>

      {/* Current admin details */}
      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Your Admin Details</h2>

        {currentAdmin ? (
          <div style={styles.detailGrid}>
            <div style={styles.detailRow}>
              <span style={styles.label}>Name</span>
              <span style={styles.value}>{currentAdmin.name}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.label}>Admin ID</span>
              <span style={styles.value}>{currentAdmin.employeeId}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.label}>Password</span>
              <span style={styles.value}>
                {showPassword ? currentAdmin.password : '•'.repeat(currentAdmin.password.length)}
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={styles.linkButton}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </div>
          </div>
        ) : (
          <p style={styles.muted}>No admin is currently logged in.</p>
        )}
      </section>

      {/* Add new admin */}
      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Add New Admin</h2>
        <form onSubmit={handleAddAdmin} style={styles.form}>
          <div style={styles.formRow}>
            <label style={styles.formLabel}>Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              placeholder="e.g. EMP04"
              style={styles.input}
            />
          </div>

          <div style={styles.formRow}>
            <label style={styles.formLabel}>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Priya Nair"
              style={styles.input}
            />
          </div>

          <div style={styles.formRow}>
            <label style={styles.formLabel}>Password</label>
            <input
              type="text"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Set a password"
              style={styles.input}
            />
          </div>

          {formError && <p style={styles.error}>{formError}</p>}
          {successMsg && <p style={styles.success}>{successMsg}</p>}

          <button type="submit" style={styles.submitButton} disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Admin'}
          </button>
        </form>
      </section>

      {/* Existing admins list */}
      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Current Admins ({admins.length})</h2>
        <ul style={styles.adminList}>
          {admins.map((a) => (
            <li key={a.id} style={styles.adminItem}>
              <span style={styles.adminName}>{a.name}</span>
              <span style={styles.adminId}>{a.employeeId}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

const styles = {
  page: {
    maxWidth: 640,
    margin: '0 auto',
    padding: '32px 20px',
    fontFamily: 'system-ui, sans-serif',
    color: '#1f2328',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 24,
  },
  card: {
    background: '#fff',
    border: '1px solid #e2e5e9',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 16,
  },
  detailGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f0f1f3',
    paddingBottom: 10,
  },
  label: {
    color: '#6b7280',
    fontSize: 14,
  },
  value: {
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontSize: 13,
    padding: 0,
  },
  muted: {
    color: '#6b7280',
    fontSize: 14,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  formRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  formLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: 500,
  },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    outline: 'none',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    margin: 0,
  },
  success: {
    color: '#16a34a',
    fontSize: 13,
    margin: 0,
  },
  submitButton: {
    marginTop: 4,
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  adminList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  adminItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f0f1f3',
    fontSize: 14,
  },
  adminName: {
    fontWeight: 500,
  },
  adminId: {
    color: '#6b7280',
  },
}

export default Settings