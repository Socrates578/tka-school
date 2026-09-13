import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EmployeesPage from './pages/EmployeesPage'
import StudentsPage from './pages/StudentsPage'
import ParentsPage from './pages/ParentsPage'
import AttendancePage from './pages/AttendancePage'
import DevicesPage from './pages/DevicesPage'
import UsersPage from './pages/UsersPage'
import AuditPage from './pages/AuditPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="employees" element={<ProtectedRoute permission="employees.read"><EmployeesPage /></ProtectedRoute>} />
              <Route path="students" element={<ProtectedRoute permission="students.read"><StudentsPage /></ProtectedRoute>} />
              <Route path="parents" element={<ProtectedRoute permission="parents.read"><ParentsPage /></ProtectedRoute>} />
              <Route path="attendance" element={<ProtectedRoute permission="attendance.read"><AttendancePage /></ProtectedRoute>} />
              <Route path="devices" element={<ProtectedRoute permission="devices.manage"><DevicesPage /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute permission="users.manage"><UsersPage /></ProtectedRoute>} />
              <Route path="audit" element={<ProtectedRoute permission="audit.read"><AuditPage /></ProtectedRoute>} />
              <Route path="setti  ngs" element={<SettingsPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
