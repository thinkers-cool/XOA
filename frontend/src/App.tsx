import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Layout } from '@/Layout';
import Tickets from '@/pages/Tickets';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import UserProfile from '@/pages/user/Profile';
import UserPreferences from '@/pages/user/Preferences';
import TicketTemplateManagement from '@/pages/management/Template';
import UserManagement from '@/pages/management/User';
import ResourceManagement from '@/pages/management/Resource';
import Insights from '@/pages/Insights';
import { useAuth } from '@/hooks/useAuth';

function App() {
  const auth = useAuth();
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!auth.isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Insights />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/tickets/opened" element={<Tickets />} />
                    <Route path="/tickets/closed" element={<Tickets />} />
                    <Route path="/management/template" element={<TicketTemplateManagement />} />
                    <Route path="/management/users" element={<UserManagement />} />
                    <Route path="/management/resource" element={<ResourceManagement />} />
                    <Route path="/user/profile" element={<UserProfile />} />
                    <Route path="/user/preferences" element={<UserPreferences />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
