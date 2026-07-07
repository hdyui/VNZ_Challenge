import { createBrowserRouter } from "react-router-dom";
import RequireAuth from "@/shared/components/guards/RequireAuth";
import RequireUnAuth from "@/shared/components/guards/RequireUnAuth";

// --- CÁC LAYOUT ---
import MainLayout from "@/shared/layouts/MainLayout";
import AdminMainLayout from "@/shared/layouts/AdminMainLayout";
import EmployeeProfileLayout from "@/features/employees/components/layout/EmployeeProfileLayout";

import { HomePage } from "@/features/auth/pages/HomePage";
import { LoginPage } from "@/features/auth/pages/LoginPage";

// --- ADMIN & EMPLOYEE (QUẢN LÝ) ---

// ─── News ────────────────────────────────────────────────────────────────────
import {
  NewsListPage,
  NewsCreatePage,
  NewsEditPage,
  NewsDetailPage,
} from "@/features/news";
import PublicNewsPage from "@/features/publicNews/pages/PublicNewsPage";
import PublicNewsDetailPage from "@/features/publicNews/pages/PublicNewsDetailPage";
import { AdminDashboardPage } from "@/features/dashBoard";
import RecruitmentPage from "@/features/recruiments/pages/RecruitmentPage";
import RecruitmentCreatePage from "@/features/recruiments/pages/RecruitmentCreatePage";
import RecruitmentUpdatePage from "@/features/recruiments/pages/RecruitmentUpdatePage";
import RecruitmentDetailsPPage from "@/features/recruiments/pages/RecruitmentDetails";
import PublicRecruitmentPage from "@/features/recruiments/pages/PublicRecruitmentPage";
import PublicRecruitmentDetailPage from "@/features/recruiments/pages/PublicRecruitmentDetailsPage";
import { AccountListPage } from "@/features/employees/pages/AccountListPage";
import { AccountCreatePage } from "@/features/employees/pages/AccountCreatePage";
import { AccountEditPage } from "@/features/employees/pages/AccountEditPage";
import { DepartmentListPage } from "@/features/departments/pages/DepartmentListPage";
import { DepartmentCreatePage } from "@/features/departments/pages/DepartmentCreatePage";
import { DepartmentEditPage } from "@/features/departments/pages/DepartmentEditPage";
import { DepartmentDetailPage } from "@/features/departments/pages/DepartmentDetailPage";
import ProfilePage from "@/features/account/pages/ProfilePage";

// ─── Shifts & WorkSchedules ────────────────────────────────────────────────
import {
  ShiftListPage,
  ShiftCreatePage,
  ShiftEditPage,
} from "@/features/shifts";
import {
  ScheduleListPage,
  ScheduleCreatePage,
  ScheduleEditPage,
  ScheduleDuplicateCreatePage,
  MySchedulePage,
} from "@/features/workSchedules";
import About from "@/shared/layouts/About";
import LeaveApplicationListPage from "@/features/leave-application/pages/LeaveApplicationListPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <About /> },
      { path: "news", element: <PublicNewsPage /> },
      { path: "news/:slug", element: <PublicNewsDetailPage /> },
      { path: "recruitments", element: <PublicRecruitmentPage /> },
      { path: "recruitments/:id", element: <PublicRecruitmentDetailPage /> },
      {
        element: <RequireUnAuth />,
        children: [{ path: "login", element: <LoginPage /> }],
      },
    ],
  },

  {
    path: "/admin",
    element: <RequireAuth allowedRoles={["Admin"]} />,
    children: [
      {
        element: <AdminMainLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },

          { path: "profile", element: <ProfilePage /> },

          // Employees
          { path: "accounts", element: <AccountListPage /> },
          { path: "accounts/create", element: <AccountCreatePage /> },
          { path: "accounts/update/:id", element: <AccountEditPage /> },

          // Departments
          { path: "departments", element: <DepartmentListPage /> },
          { path: "departments/create", element: <DepartmentCreatePage /> },
          { path: "departments/update/:id", element: <DepartmentEditPage /> },
          { path: "departments/:id", element: <DepartmentDetailPage /> },

          // News
          { path: "news", element: <NewsListPage /> },
          { path: "news/create", element: <NewsCreatePage /> },
          { path: "news/update/:id", element: <NewsEditPage /> },
          { path: "news/:id", element: <NewsDetailPage /> },

          // Recruitments
          { path: "recruitments", element: <RecruitmentPage /> },
          {
            path: "recruitments/create",
            element: <RecruitmentCreatePage />,
          },
          {
            path: "recruitments/update/:id",
            element: <RecruitmentUpdatePage />,
          },
          {
            path: "recruitments/:id",
            element: <RecruitmentDetailsPPage />,
          },

          // Shifts
          { path: "shifts", element: <ShiftListPage /> },
          { path: "shifts/create", element: <ShiftCreatePage /> },
          { path: "shifts/update/:id", element: <ShiftEditPage /> },

          // Work Schedules
          { path: "schedules", element: <ScheduleListPage /> },
          { path: "schedules/create", element: <ScheduleCreatePage /> },
          { path: "schedules/update/:id", element: <ScheduleEditPage /> },
          {
            path: "schedules/duplicate-create",
            element: <ScheduleDuplicateCreatePage />,
          },
          {
            path: "leave-applications",
            element: <LeaveApplicationListPage />,
          },
        ],
      },
    ],
  },

  {
    path: "/employee",
    element: <RequireAuth allowedRoles={["Employee"]} />,
    children: [
      {
        element: <EmployeeProfileLayout />,
        children: [
          { index: true, element: <ProfilePage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "schedule", element: <MySchedulePage /> },
        ],
      },
    ],
  },
]);
