import { api } from './api';
import { DashboardOverview, RecentActivity } from '../types/dashboard';

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get<DashboardOverview>('/dashboard/overview');
    return response.data;
  },

  async getRecentActivity(): Promise<RecentActivity> {
    const response = await api.get<RecentActivity>('/dashboard/activity/recent');
    return response.data;
  },
};
