import { createBrowserRouter } from 'react-router-dom';

import AuthLayout from '@/layouts/auth-layout';
import AppLayout from '@/layouts/app-layout';
import { RedirectIfAuthenticated, RequireAuth, RequireChefAnbu } from '@/components/auth-guard';

import LoginPage from '@/pages/auth/login-page';
import RegisterPage from '@/pages/auth/register-page';
import PendingPage from '@/pages/auth/pending-page';
import DashboardPage from '@/pages/dashboard/dashboard-page';
import NinjaRecordsPage from '@/pages/ninja-records/ninja-records-page';
import NinjaRecordDetailPage from '@/pages/ninja-records/ninja-record-detail-page';
import MyReportsPage from '@/pages/reports/my-reports-page';
import AccountsPage from '@/pages/admin/accounts-page';
import CodesPage from '@/pages/admin/codes-page';
import AdminReportsPage from '@/pages/admin/admin-reports-page';

export const router = createBrowserRouter([
  // Public auth routes
  {
    element: <RedirectIfAuthenticated />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },

  // Pending page (authenticated but not yet approved)
  { path: '/pending', element: <PendingPage /> },

  // Authenticated routes
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/ninja-records', element: <NinjaRecordsPage /> },
          { path: '/ninja-records/:id', element: <NinjaRecordDetailPage /> },
          { path: '/my-reports', element: <MyReportsPage /> },

          // Chef ANBU only
          {
            element: <RequireChefAnbu />,
            children: [
              { path: '/admin/accounts', element: <AccountsPage /> },
              { path: '/admin/codes', element: <CodesPage /> },
              { path: '/admin/personal-reports', element: <AdminReportsPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
