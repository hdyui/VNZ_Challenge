// src/features/dashboard/type.ts

export interface DashboardStats {
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  totalEmployees: number;
  totalRecruitments: number;
  activeRecruitments: number;
}

export interface DashboardRecentNews {
  id: string;
  title: string;
  slug: string;
  coverImg: string | null;
  status: "draft" | "published" | "archived";
  author: {
    id: string;
    fullName: string;
  };
  createdAt: string;
  publishedAt: string | null;
}

export interface DashboardData {
  stats: DashboardStats;
  recentNews: DashboardRecentNews[];
}
